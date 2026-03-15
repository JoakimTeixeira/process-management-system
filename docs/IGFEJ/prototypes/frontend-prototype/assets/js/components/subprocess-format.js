function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block.type === "text") return block.text || "";
      if (block.type === "list" && Array.isArray(block.items)) {
        return block.items.map((item) => `${item.text || ""}${item.description ? `: ${item.description}` : ""}`).join("\n");
      }
      return "";
    })
    .join("\n\n");
}

function normalizeStructuredField(field) {
  if (!field) return [];
  if (field.blocks && Array.isArray(field.blocks)) {
    return normalizeBlocks(field.blocks).split("\n").filter((line) => line.trim());
  }
  if (Array.isArray(field)) return field;
  return typeof field === "string" ? [field] : [];
}

function normalizeDescription(description) {
  if (!description) return "";
  if (description.blocks && Array.isArray(description.blocks)) return normalizeBlocks(description.blocks);
  return typeof description === "string" ? description : "";
}

function normalizeActivities(activities) {
  if (!activities) return { description: "", items: [] };
  if (activities.blocks && Array.isArray(activities.blocks)) {
    return activities.blocks.reduce(
      (acc, block) => {
        if (block.type === "text") acc.description.push(block.text || "");
        if (block.type === "list" && Array.isArray(block.items)) {
          acc.items.push(...block.items.map((item) => `${item.text || ""}${item.description ? `: ${item.description}` : ""}`));
        }
        return acc;
      },
      { description: [], items: [] },
    );
  }

  if (Array.isArray(activities)) {
    return {
      description: "",
      items: activities.flatMap((activity) => {
        const title = activity?.title ? `${activity.title}: ` : "";
        return Array.isArray(activity?.bullets) && activity.bullets.length > 0
          ? activity.bullets.map((bullet) => `${title}${bullet}`)
          : activity?.title
            ? [activity.title]
            : [];
      }),
    };
  }

  return {
    description: activities.description || "",
    items: Array.isArray(activities.items) ? activities.items : [],
  };
}

function renderSubprocessSection(sectionNumber, sectionTitle, content) {
  if (!content) return "";
  return `
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        <span class="text-base font-semibold text-gray-700 mr-2">${sectionNumber}</span>${sectionTitle}
      </h3>
      ${content}
    </div>
  `;
}

function getSubprocessSectionSpan(sectionTitle) {
  return new Set(["Exemplos", "Metadados"]).has(sectionTitle) ? "lg:col-span-2" : "";
}

function wrapSubprocessSection(sectionTitle, sectionMarkup) {
  return sectionMarkup ? `<div class="${getSubprocessSectionSpan(sectionTitle)}">${sectionMarkup}</div>` : "";
}

function renderSubprocessArraySection(sectionNumber, sectionTitle, items, options = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const content = options.variant === "tags"
    ? safeItems.length
      ? `<div class="flex flex-wrap gap-2">${safeItems.map((item) => `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-govpt-blue-light text-govpt-primary">${item}</span>`).join("")}</div>`
      : `<p class="text-sm text-gray-500">N/A</p>`
    : safeItems.length
      ? `<ul class="space-y-2 ml-6">${safeItems.map((item) => `<li class="text-sm text-gray-700 list-disc">${item}</li>`).join("")}</ul>`
      : `<p class="text-sm text-gray-500">N/A</p>`;

  return renderSubprocessSection(sectionNumber, sectionTitle, content);
}

function renderSubprocessTextSection(sectionNumber, sectionTitle, text) {
  if (!text) {
    return renderSubprocessSection(sectionNumber, sectionTitle, `<p class="text-sm text-gray-500">N/A</p>`);
  }

  const content = text.split("\n\n").map((paragraph) => {
    const lines = paragraph.split("\n").filter((line) => line.trim());
    const hasListItems = lines.some((line) => line.includes(":") && line.split(":").length >= 2);
    if (!hasListItems) return `<p class="text-gray-700 leading-relaxed mb-4">${paragraph}</p>`;

    return `<ul class="space-y-1 ml-6 mb-4 list-disc">${lines.map((line) => {
      const [title, ...rest] = line.split(":");
      return rest.length
        ? `<li class="text-sm text-gray-700"><span class="font-medium">${title.trim()}</span>: ${rest.join(":").trim()}</li>`
        : `<li class="text-sm text-gray-700">${line.trim()}</li>`;
    }).join("")}</ul>`;
  }).join("");

  return renderSubprocessSection(sectionNumber, sectionTitle, content);
}

function renderSubprocessActivitiesSection(sectionNumber, subprocess) {
  const activities = normalizeActivities(subprocess.activities);
  const items = activities.items || [];
  const description = Array.isArray(activities.description) ? activities.description.filter(Boolean).join("\n\n") : activities.description;

  return renderSubprocessSection(
    sectionNumber,
    "Actividades",
    `
      <div class="space-y-4">
        ${description ? `<p class="text-sm text-gray-700 leading-relaxed">${description}</p>` : ""}
        ${items.length
          ? `<div class="bg-gray-50 rounded p-4"><ul class="space-y-2 ml-6">${items.map((item, index) => {
              const [title, ...rest] = item.split(":");
              return `<li class="text-sm text-gray-600 list-disc"><span class="font-semibold text-gray-900">${index + 1}. ${title}</span>${rest.length ? `: ${rest.join(":")}` : ""}</li>`;
            }).join("")}</ul></div>`
          : `<p class="text-sm text-gray-500">N/A</p>`}
      </div>
    `,
  );
}

function renderSubprocessInformationClassificationSection(sectionNumber, informationClassification) {
  const values = Array.isArray(informationClassification?.values) ? informationClassification.values : [];
  const note = informationClassification?.note || "";

  return renderSubprocessSection(
    sectionNumber,
    "Classificação da informação",
    `
      <div class="space-y-3">
        ${values.length ? `<div class="flex flex-wrap gap-2">${values.map((value) => `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-govpt-blue-light text-govpt-primary">${value}</span>`).join("")}</div>` : ""}
        ${note ? `<p class="text-sm text-gray-700 leading-relaxed">${note}</p>` : ""}
        ${values.length === 0 && !note ? `<p class="text-sm text-gray-500">N/A</p>` : ""}
      </div>
    `,
  );
}

function renderSubprocessMetadataSection(sectionNumber, metadata) {
  const interviewer = metadata?.interviewer || "";
  const interviewed = Array.isArray(metadata?.interviewed) ? metadata.interviewed : [];

  return renderSubprocessSection(
    sectionNumber,
    "Metadados",
    `
      <dl class="space-y-3">
        ${interviewer ? `<div><dt class="text-sm font-medium text-gray-600">Entrevistador</dt><dd class="mt-1 text-sm text-gray-900">${interviewer}</dd></div>` : ""}
        ${interviewed.length ? `<div><dt class="text-sm font-medium text-gray-600">Entrevistados</dt><dd class="mt-1 text-sm text-gray-900">${interviewed.join(", ")}</dd></div>` : `<p class="text-sm text-gray-500">N/A</p>`}
      </dl>
    `,
  );
}

Object.assign(window, {
  normalizeBlocks,
  normalizeStructuredField,
  normalizeDescription,
  normalizeActivities,
  renderSubprocessSection,
  getSubprocessSectionSpan,
  wrapSubprocessSection,
  renderSubprocessArraySection,
  renderSubprocessTextSection,
  renderSubprocessActivitiesSection,
  renderSubprocessInformationClassificationSection,
  renderSubprocessMetadataSection,
});
