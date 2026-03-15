let bpmnInstance = null;
let bpmnResizeObserver = null;
let fitRafId = null;
let activeBpmnContainerId = "bpmn-container";
let fullscreenListenerBound = false;
let handToolCleanup = null;

const BPMN_CONTAINER_IDS = ["bpmn-container", "subprocess-bpmn-container"];
const FALLBACK_MESSAGE = `
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

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}
function setActiveContainer(containerId) { if (containerId) activeBpmnContainerId = containerId; }

function getContainer(containerId = activeBpmnContainerId) {
  for (const id of uniq([containerId, ...BPMN_CONTAINER_IDS])) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

function getCanvas() {
  const canvas = bpmnInstance?.get?.("canvas");
  return typeof canvas?.zoom === "function" ? canvas : null;
}

function getCurrentFilename(ext = ".bpmn") {
  const name = window.currentBPMNUrl?.split("/").pop() || "diagram.bpmn";
  return ext === ".bpmn" ? name : name.replace(/\.bpmn$/i, ext);
}

function appendDownloadOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.appendChild(option);
}

function hasDownloadFile(files, key) {
  return (files || []).some((file) => {
    const value = file?.[key];
    if (typeof value !== "string") return false;

    const normalized = value.trim().toLowerCase();
    return normalized && normalized !== "null" && normalized !== "undefined" && normalized !== "n/a";
  });
}

function removeViewerNoise(container) {
  container?.querySelectorAll(".bjs-powered-by,.djs-outline").forEach((el) => el.remove());
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function stopPreviousInstance() {
  if (fitRafId !== null) cancelAnimationFrame(fitRafId);
  fitRafId = null;
  if (typeof handToolCleanup === "function") {
    try {
      handToolCleanup();
    } catch {}
    handToolCleanup = null;
  }

  if (bpmnResizeObserver) {
    try {
      bpmnResizeObserver.disconnect();
    } catch {}
    bpmnResizeObserver = null;
  }

  if (typeof bpmnInstance?.destroy === "function") {
    try {
      bpmnInstance.destroy();
    } catch (err) {
      console.warn("Failed to destroy previous BPMN instance:", err);
    }
  }

  bpmnInstance = null;
}

function fitViewportSafely(retryCount = 0) {
  const canvas = getCanvas();
  const container = getContainer();
  if (!canvas || !container) return;

  const { width, height } = container.getBoundingClientRect();
  const invalid = !isFinite(width) || !isFinite(height) || width < 50 || height < 50;
  if (invalid) {
    if (retryCount < 5) setTimeout(() => fitViewportSafely(retryCount + 1), 200);
    return;
  }

  if (fitRafId !== null) cancelAnimationFrame(fitRafId);
  fitRafId = requestAnimationFrame(() => {
    try {
      canvas.zoom("fit-viewport");
    } catch {
      try {
        canvas.zoom(1);
      } catch {
        try {
          canvas.zoom(0.8);
        } catch {}
      }
    } finally {
      fitRafId = null;
    }
  });
}

function ensureResizeAutoFit(container) {
  if (!container || typeof ResizeObserver === "undefined") return;

  if (bpmnResizeObserver) {
    try {
      bpmnResizeObserver.disconnect();
    } catch {}
  }

  bpmnResizeObserver = new ResizeObserver(() => fitViewportSafely());
  bpmnResizeObserver.observe(container);

  if (!fullscreenListenerBound) {
    document.addEventListener("fullscreenchange", () => fitViewportSafely(), {
      passive: true,
    });
    fullscreenListenerBound = true;
  }
}

function enableTemporaryHandTool(container) {
  if (!container) return;

  if (typeof handToolCleanup === "function") {
    try {
      handToolCleanup();
    } catch {}
  }

  let dragState = null;
  let isHovering = false;
  let isCtrlPressed = false;
  const getCursorTargets = () => [container, ...container.querySelectorAll(".djs-container,.djs-container svg,.viewport")];
  const setViewerCursor = (value) => {
    getCursorTargets().forEach((element) => {
      if (element?.style) element.style.cursor = value;
    });
  };

  const updateCursor = () => {
    if (dragState) {
      setViewerCursor("grabbing");
      return;
    }

    if (!isHovering) {
      setViewerCursor("default");
      return;
    }

    setViewerCursor(isCtrlPressed ? "grab" : "default");
  };

  const stopDrag = () => {
    dragState = null;
    updateCursor();
  };

  const handleDragMove = (event) => {
    if (!dragState) return;

    const canvas = getCanvas();
    if (!canvas || typeof canvas.viewbox !== "function") return;

    const rect = dragState.rect;
    if (!rect.width || !rect.height) return;

    const viewbox = canvas.viewbox();
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const scaleX = dragState.viewbox.width / rect.width;
    const scaleY = dragState.viewbox.height / rect.height;

    canvas.viewbox({
      x: dragState.viewbox.x - (dx * scaleX),
      y: dragState.viewbox.y - (dy * scaleY),
      width: viewbox.width,
      height: viewbox.height,
    });
  };

  const handleMouseDown = (event) => {
    if (event.button !== 0 || !event.ctrlKey) return;
    if (!event.target.closest(".djs-container,.bpmn-container")) return;

    const canvas = getCanvas();
    if (!canvas || typeof canvas.viewbox !== "function") return;

    event.preventDefault();
    event.stopPropagation();

    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      rect: container.getBoundingClientRect(),
      viewbox: canvas.viewbox(),
    };

    setViewerCursor("grabbing");
  };

  const handleMouseEnter = (event) => {
    isHovering = true;
    isCtrlPressed = event.ctrlKey;
    updateCursor();
  };

  const handleMouseMove = (event) => {
    isCtrlPressed = event.ctrlKey;
    updateCursor();
  };

  const handleMouseLeave = () => {
    isHovering = false;
    isCtrlPressed = false;
    if (!dragState) setViewerCursor("default");
  };

  const handleKeyChange = (event) => {
    isCtrlPressed = event.ctrlKey;
    updateCursor();
  };

  const handleWindowBlur = () => stopDrag();

  container.addEventListener("mouseenter", handleMouseEnter);
  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseleave", handleMouseLeave);
  container.addEventListener("mousedown", handleMouseDown, true);
  window.addEventListener("keydown", handleKeyChange);
  window.addEventListener("keyup", handleKeyChange);
  window.addEventListener("mousemove", handleDragMove);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("blur", handleWindowBlur);

  handToolCleanup = () => {
    container.removeEventListener("mouseenter", handleMouseEnter);
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", handleMouseLeave);
    container.removeEventListener("mousedown", handleMouseDown, true);
    window.removeEventListener("keydown", handleKeyChange);
    window.removeEventListener("keyup", handleKeyChange);
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("blur", handleWindowBlur);
    stopDrag();
  };
}

function showBPMNFallback(containerId = "bpmn-container") {
  const container = getContainer(containerId);
  if (container) container.innerHTML = FALLBACK_MESSAGE;
}

async function loadBPMDiagram(url, containerId = "bpmn-container") {
  const container = getContainer(containerId);
  if (!container) {
    console.error("BPMN container not found:", containerId);
    return;
  }

  stopPreviousInstance();
  setActiveContainer(containerId);
  window.currentBPMNUrl = url;

  if (typeof window.BpmnJS !== "function") {
    console.error("BpmnJS is not available on window.");
    showBPMNFallback(containerId);
    return;
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load BPMN file: ${response.status} ${response.statusText}`);
    }

    const bpmnXML = await response.text();
    container.innerHTML = "";
    bpmnInstance = new window.BpmnJS({ container, width: "100%", height: "100%" });

    const result = await bpmnInstance.importXML(bpmnXML);
    if (result?.warnings?.length) console.warn("BPMN import warnings:", result.warnings);

    removeViewerNoise(container);
    window.updateDownloadOptions?.();
    fitViewportSafely();
    ensureResizeAutoFit(container);
    enableTemporaryHandTool(container);
    setTimeout(() => window.fitBPMN?.(containerId), 150);
  } catch (err) {
    console.error("Error loading/rendering BPMN:", err);
    showBPMNFallback(containerId);
  }
}

async function downloadBPMN() {
  if (!window.currentBPMNUrl) {
    alert("No BPMN file loaded");
    return;
  }

  try {
    const response = await fetch(window.currentBPMNUrl);
    if (!response.ok) throw new Error("Failed to download BPMN file");
    downloadBlob(await response.blob(), getCurrentFilename(".bpmn"));
  } catch (err) {
    console.error("Error downloading BPMN:", err);
    alert("Failed to download BPMN file");
  }
}

function saveSvgWithCallback() {
  return new Promise((resolve, reject) => {
    bpmnInstance.saveSVG((err, svg) => (err ? reject(err) : resolve(svg)));
  });
}

async function downloadSVG() {
  if (!bpmnInstance) {
    alert("Diagrama não está carregado. Carregue um diagrama primeiro.");
    return;
  }
  if (typeof bpmnInstance.saveSVG !== "function") {
    alert("Exportação SVG não suportada neste diagrama.");
    return;
  }

  try {
    const result = await bpmnInstance.saveSVG().catch(() => saveSvgWithCallback());
    const svg = typeof result === "object" && result?.svg ? result.svg : result;
    const error = typeof result === "object" ? result?.error : null;
    if (error) throw error;
    if (!svg) throw new Error("Nenhum dado SVG recebido do diagrama.");
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), getCurrentFilename(".svg"));
  } catch (err) {
    console.error("Error exporting SVG:", err);
    alert("Erro ao exportar SVG: " + (err.message || err));
  }
}

function downloadDMN() { alert("DMN download not implemented yet"); }

function updateDownloadOptions() {
  const formatSelect = document.getElementById("download-format");
  if (!formatSelect) return;

  formatSelect.innerHTML = "";
  if (window.currentBPMNUrl) {
    appendDownloadOption(formatSelect, "bpmn", "BPMN");
  }

  const files = window.currentAsset?.files || [];
  if (hasDownloadFile(files, "svg_file")) {
    appendDownloadOption(formatSelect, "svg", "SVG");
  }
  if (hasDownloadFile(files, "dmn_file")) {
    appendDownloadOption(formatSelect, "dmn", "DMN");
  }
}

function downloadSelectedFormat() {
  const selectedFormat = document.getElementById("download-format")?.value;
  const actions = { bpmn: downloadBPMN, svg: downloadSVG, dmn: downloadDMN };
  const action = actions[selectedFormat];
  if (!action) {
    alert("Invalid format selected");
    return;
  }
  action();
}

window.loadBPMDiagram = loadBPMDiagram;
window.showBPMNFallback = showBPMNFallback;
window.zoomInBPMN = () => getCanvas()?.zoom(getCanvas().zoom() * 1.2);
window.zoomOutBPMN = () => getCanvas()?.zoom(getCanvas().zoom() * 0.8);
window.fitBPMN = (containerId = null) => {
  setActiveContainer(containerId);
  fitViewportSafely();
};
window.fullscreenBPMN = () => {
  const container = getContainer();
  if (!container) return;
  (
    container.requestFullscreen ||
    container.mozRequestFullScreen ||
    container.webkitRequestFullscreen ||
    container.msRequestFullscreen
  )?.call(container);
};
window.downloadBPMN = downloadBPMN;
window.downloadSVG = downloadSVG;
window.downloadDMN = downloadDMN;
window.downloadSelectedFormat = downloadSelectedFormat;
window.updateDownloadOptions = updateDownloadOptions;
window.BPMNUtils = { loadDiagram: loadBPMDiagram, showFallback: showBPMNFallback, zoomIn: window.zoomInBPMN, zoomOut: window.zoomOutBPMN, fit: window.fitBPMN, fullscreen: window.fullscreenBPMN };
