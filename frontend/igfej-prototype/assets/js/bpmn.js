/* ✅ BPMN Visualizer Fix (safe cleanup + reliable fit on resize/fullscreen) */

/** @type {any | null} */
let bpmnInstance = null;
/** @type {number | null} */
let cleanupIntervalId = null; // kept for compatibility (no longer used)
/** @type {ResizeObserver | null} */
let bpmnResizeObserver = null;
/** @type {number | null} */
let fitRafId = null;

function stopPreviousInstance() {
  if (cleanupIntervalId !== null) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }

  if (fitRafId !== null) {
    cancelAnimationFrame(fitRafId);
    fitRafId = null;
  }

  if (bpmnResizeObserver) {
    try {
      bpmnResizeObserver.disconnect();
    } catch {
      // ignore
    }
    bpmnResizeObserver = null;
  }

  if (bpmnInstance && typeof bpmnInstance.destroy === "function") {
    try {
      bpmnInstance.destroy();
    } catch (err) {
      console.warn("Failed to destroy previous BPMN instance:", err);
    }
  }

  bpmnInstance = null;
}

function removeUnwantedElements(container) {
  if (!container) return;

  // ✅ SAFE to remove (doesn't break the renderer)
  container.querySelectorAll(".bjs-powered-by").forEach((el) => el.remove());

  // Optional: keep selection outline if you want click/selection feedback.
  // If you really want it gone, remove it ONCE (safe-ish), but don't touch layer-overlays.
  container.querySelectorAll(".djs-outline").forEach((el) => el.remove());
}

function fitViewportSafely(retryCount = 0) {
  if (!bpmnInstance || typeof bpmnInstance.get !== "function") return;

  const canvas = bpmnInstance.get("canvas");
  if (!canvas || typeof canvas.zoom !== "function") return;

  // Try both possible container IDs
  let container = document.getElementById("bpmn-container");
  if (!container) {
    container = document.getElementById("subprocess-bpmn-container");
  }
  if (!container) return;

  // Check if container has proper dimensions (not 0, not NaN, not too small)
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Check for invalid dimensions
  if (
    !isFinite(width) ||
    !isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    width < 50 ||
    height < 50
  ) {
    // Container not properly sized yet, retry after delay (max 5 retries)
    if (retryCount < 5) {
      setTimeout(() => fitViewportSafely(retryCount + 1), 200);
      return;
    }
    console.warn("Container dimensions invalid after retries:", {
      width,
      height,
      retryCount,
    });
    return;
  }

  // Defer to next frame so the container has final size
  if (fitRafId !== null) cancelAnimationFrame(fitRafId);

  fitRafId = requestAnimationFrame(() => {
    try {
      // Try to fit viewport
      canvas.zoom("fit-viewport");
    } catch (fitError) {
      console.warn("fit-viewport failed:", fitError);
      try {
        // Fallback: try to zoom to 1 (100%)
        canvas.zoom(1);
      } catch (zoomError) {
        console.warn("Fallback zoom also failed:", zoomError);
        // Final fallback: try to zoom to 0.8
        try {
          canvas.zoom(0.8);
        } catch (finalError) {
          console.warn("All zoom attempts failed:", finalError);
        }
      }
    } finally {
      fitRafId = null;
    }
  });
}

function setupResizeAutoFit(container) {
  if (!container || typeof ResizeObserver === "undefined") return;

  if (bpmnResizeObserver) {
    try {
      bpmnResizeObserver.disconnect();
    } catch {
      // ignore
    }
  }

  bpmnResizeObserver = new ResizeObserver(() => {
    fitViewportSafely();
  });

  bpmnResizeObserver.observe(container);

  // Also refit after fullscreen changes (some browsers don't trigger ResizeObserver immediately)
  document.addEventListener("fullscreenchange", fitViewportSafely, {
    passive: true,
  });
}

async function loadBPMDiagram(url, containerId = "bpmn-container") {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("BPMN container not found:", containerId);
    return;
  }

  stopPreviousInstance();

  // Store the current URL for download
  window.currentBPMNUrl = url;

  /** @type {any} */
  const BpmnCtor = window.BpmnJS;
  if (typeof BpmnCtor !== "function") {
    console.error(
      "BpmnJS is not available on window. Make sure bpmn-js is loaded before this script.",
    );
    showBPMNFallback(containerId);
    return;
  }

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(
        `Failed to load BPMN file: ${response.status} ${response.statusText}`,
      );
    }

    const bpmnXML = await response.text();

    container.innerHTML = "";

    bpmnInstance = new BpmnCtor({
      container,
      width: "100%",
      height: "100%",
      // keyboard: { bindTo: window }, // enable if you want keyboard navigation
    });

    const importResult = await bpmnInstance.importXML(bpmnXML);
    if (importResult && importResult.warnings && importResult.warnings.length) {
      console.warn("BPMN import warnings:", importResult.warnings);
    }

    // Update download options (guard if missing)
    if (typeof window.updateDownloadOptions === "function") {
      window.updateDownloadOptions();
    }

    // Additional automatic fit viewport with delay to ensure proper sizing
    setTimeout(() => {
      if (window.fitBPMN && typeof window.fitBPMN === "function") {
        window.fitBPMN();
      }
    }, 500); // Increased to 500ms for better compatibility with search navigation

    removeUnwantedElements(container);
    fitViewportSafely();
    setupResizeAutoFit(container);
  } catch (err) {
    console.error("Error loading/rendering BPMN:", err);
    showBPMNFallback(containerId);
  }
}

window.loadBPMDiagram = loadBPMDiagram;

function showBPMNFallback(containerId = "bpmn-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center h-full">
      <div class="text-center p-4">
        <svg class="h-16 w-16 mx-auto mb-4 text-igfej-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
          </path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Diagrama</h3>
        <p class="text-sm text-gray-600 mb-2">Visualização do processo em formato BPMN</p>
        <p class="text-xs text-gray-500">Arquivo não disponível</p>
        <p class="text-xs text-red-500 mt-2">Não foi possível carregar o diagrama</p>
        <p class="text-xs text-gray-400 mt-1">Verifique o console para detalhes</p>
      </div>
    </div>
  `;
}

// Helper function to download blob
/**
 * @param {Blob} blob
 * @param {string} filename
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.zoomInBPMN = function zoomInBPMN() {
  if (bpmnInstance && typeof bpmnInstance.get === "function") {
    const canvas = bpmnInstance.get("canvas");
    if (canvas && typeof canvas.zoom === "function") {
      canvas.zoom(canvas.zoom() * 1.2);
    }
  }
};

window.zoomOutBPMN = function zoomOutBPMN() {
  if (bpmnInstance && typeof bpmnInstance.get === "function") {
    const canvas = bpmnInstance.get("canvas");
    if (canvas && typeof canvas.zoom === "function") {
      canvas.zoom(canvas.zoom() * 0.8);
    }
  }
};

window.fitBPMN = function fitBPMN() {
  fitViewportSafely();
};

window.fullscreenBPMN = function fullscreenBPMN() {
  // Try both possible container IDs
  let container = document.getElementById("bpmn-container");
  if (!container) {
    container = document.getElementById("subprocess-bpmn-container");
  }
  if (!container) return;

  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.mozRequestFullScreen) {
    // Firefox
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    // Chrome, Safari, Opera
    container.webkitRequestFullscreen();
  } else if (container.msRequestFullscreen) {
    // IE/Edge
    container.msRequestFullscreen();
  }
};

window.downloadBPMN = async function downloadBPMN() {
  if (!window.currentBPMNUrl) {
    alert("No BPMN file loaded");
    return;
  }

  try {
    const response = await fetch(window.currentBPMNUrl);
    if (!response.ok) {
      throw new Error("Failed to download BPMN file");
    }
    const bpmnBlob = await response.blob();
    const bpmnFilename =
      window.currentBPMNUrl.split("/").pop() || "diagram.bpmn";
    downloadBlob(bpmnBlob, bpmnFilename);
  } catch (err) {
    console.error("Error downloading BPMN:", err);
    alert("Failed to download BPMN file");
  }
};

window.downloadSVG = async function downloadSVG() {
  if (!bpmnInstance) {
    alert("Diagrama não está carregado. Carregue um diagrama primeiro.");
    console.error("No bpmnInstance available");
    return;
  }

  if (typeof bpmnInstance.saveSVG !== "function") {
    alert("Exportação SVG não suportada neste diagrama.");
    console.error("saveSVG method not available on bpmnInstance");
    return;
  }

  try {
    // Try Promise-based API first (newer BPMN.js versions)
    const svgResult = await bpmnInstance.saveSVG();

    let svgData = svgResult;
    let error = null;

    // Handle different result formats
    if (typeof svgResult === "object" && svgResult.svg) {
      svgData = svgResult.svg;
      error = svgResult.error;
    }

    if (error) {
      console.error("Error from saveSVG:", error);
      alert("Erro ao exportar SVG: " + error.message || error);
      return;
    }

    if (!svgData) {
      console.error("No SVG data received from Promise");
      alert("Nenhum dado SVG recebido do diagrama.");
      return;
    }

    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });

    const svgFilename = window.currentBPMNUrl
      ? (window.currentBPMNUrl.split("/").pop() || "diagram.bpmn").replace(
          /\.bpmn$/i,
          ".svg",
        )
      : "diagram.svg";

    downloadBlob(svgBlob, svgFilename);
  } catch (promiseError) {
    // Fallback to callback-based API for older versions
    bpmnInstance.saveSVG((err, svg) => {
      if (err) {
        console.error("Error exporting SVG:", err);
        alert("Erro ao exportar SVG: " + (err.message || err));
        return;
      }

      if (!svg) {
        console.error("No SVG data received from callback");
        alert("Nenhum dado SVG recebido do diagrama.");
        return;
      }

      const svgBlob = new Blob([svg], { type: "image/svg+xml" });

      const svgFilename = window.currentBPMNUrl
        ? (window.currentBPMNUrl.split("/").pop() || "diagram.bpmn").replace(
            /\.bpmn$/i,
            ".svg",
          )
        : "diagram.svg";

      downloadBlob(svgBlob, svgFilename);
    });
  }
};

window.downloadDMN = function downloadDMN() {
  alert("DMN download not implemented yet");
};

window.downloadSelectedFormat = function downloadSelectedFormat() {
  const formatSelect = document.getElementById("download-format");
  if (!formatSelect) {
    alert("Download format selector not found");
    return;
  }

  const selectedFormat = formatSelect.value;

  switch (selectedFormat) {
    case "bpmn":
      window.downloadBPMN();
      break;
    case "svg":
      window.downloadSVG();
      break;
    case "dmn":
      window.downloadDMN();
      break;
    default:
      alert("Invalid format selected");
  }
};

window.updateDownloadOptions = function updateDownloadOptions() {
  const formatSelect = document.getElementById("download-format");
  if (!formatSelect) return;

  // Clear existing options
  formatSelect.innerHTML = "";

  // Always add BPMN if we have a URL
  if (window.currentBPMNUrl) {
    const bpmnOption = document.createElement("option");
    bpmnOption.value = "bpmn";
    bpmnOption.textContent = "BPMN";
    formatSelect.appendChild(bpmnOption);
  }

  // Add SVG if currentAsset has SVG file
  if (window.currentAsset && window.currentAsset.files) {
    const hasSVG = window.currentAsset.files.some(
      (file) => file.svg_file && file.svg_file.trim() !== "",
    );
    if (hasSVG) {
      const svgOption = document.createElement("option");
      svgOption.value = "svg";
      svgOption.textContent = "SVG";
      formatSelect.appendChild(svgOption);
    }
  }

  // Add DMN if currentAsset has DMN file
  if (window.currentAsset && window.currentAsset.files) {
    const hasDMN = window.currentAsset.files.some(
      (file) => file.dmn_file && file.dmn_file.trim() !== "",
    );
    if (hasDMN) {
      const dmnOption = document.createElement("option");
      dmnOption.value = "dmn";
      dmnOption.textContent = "DMN";
      formatSelect.appendChild(dmnOption);
    }
  }
};

window.BPMNUtils = {
  loadDiagram: loadBPMDiagram,
  showFallback: showBPMNFallback,
  zoomIn: window.zoomInBPMN,
  zoomOut: window.zoomOutBPMN,
  fit: window.fitBPMN,
  fullscreen: window.fullscreenBPMN,
};
