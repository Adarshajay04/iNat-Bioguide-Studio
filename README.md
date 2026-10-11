# 🌿 BioGuide Studio

A modern web application built with **React**, **Vite**, and **Tailwind CSS** that integrates directly with the **iNaturalist API v1** to create custom biodiversity field guides, foldable nature pamphlets, and wall posters.

---

## 🌟 Key Features

1. **Live iNaturalist Autocomplete & Query Engine**:
   - **Taxa Search**: Autocomplete for species, genera, families, and classes (e.g., Birds, Butterflies, Fungi, Mammals).
   - **Place Search**: Autocomplete for geographical regions, national parks, states, and countries worldwide.
   - **Open Data & Research Grade**: Fetches research-grade observations with verified photographs.
   - **Image License Filtering**: Select from *Open Reusable (CC & Public Domain)*, *Commercial Allowed (CC0, CC-BY, CC-BY-SA)*, or *Public Domain (CC0)* to ensure all pictures can be used freely.

2. **Customizable Image Overlays**:
   - **Top of Picture**:
     - Toggle **Common Name** (e.g. *Red-tailed Hawk*)
     - Toggle **Scientific Name** (e.g. *Buteo jamaicensis*)
     - Choose ordering: Common first vs. Scientific first
     - Choose badge styling: Frosted Glass Dark, Solid Black Pill, Crisp White Badge, or Minimal Shadow
   - **Bottom of Picture**:
     - Prominent **Author's Copyright & Photographer Attribution** (e.g. *© Craig K. Hunt (CC BY-NC)*)
     - Mandatory attribution compliant with Creative Commons requirements.
   - **Real-time Sample Card Preview**: See the visual impact of any toggle instantly.

3. **Multi-Format Export Engine**:
   - 📄 **Scrollable Field Guide (Multi-Page PDF)**:
     - Formatted for field observation checklists and booklets (A4/Letter).
     - Includes species cards, observation counters, checklist checkboxes (`[ ] Observed`), and note fields.
   - 📑 **Foldable Pamphlet (Tri-Fold Brochure)**:
     - Dual spread preview: Inside 3-panel field spread + Outside cover spread with field checklist, citizen science guide, and hero cover photo.
     - Dotted fold guide lines (`--- FOLD HERE ---`) for easy printing and folding into a physical pocket brochure.
   - 🖼️ **Wall Poster (Atlas Collage)**:
     - High-density poster mosaic with custom header, regional stats, and three themes:
       - *📜 Botanical Ivory*
       - *🌲 Forest Green*
       - *🌌 Midnight Dark*
   - **Export Actions**:
     - **Print / Save as PDF**: Native crisp vector rendering via `@media print`.
     - **Direct PDF Download**: Instant file generation via `jsPDF` and `html2canvas`.
     - **High-Res PNG Download**: One-click raster poster image export.

---

## 🚀 Running the Project

```bash
# Navigate to the project directory
cd C:\Users\adars\.gemini\antigravity\scratch\inat-field-guide

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Visit `http://127.0.0.1:5173/` in your browser.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **PDF & Canvas Export**: `html2canvas` + `jsPDF` + CSS `@media print`
- **Data Source**: iNaturalist API v1 (`https://api.inaturalist.org/v1/`)
