
import React, { useState } from 'react';
import FileSaver from 'file-saver';
import { CsvItem, CSV_CONSTANTS } from '../types';
import { Plus, Download, Trash2, RefreshCw } from 'lucide-react';

export const CsvGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [csvItems, setCsvItems] = useState<CsvItem[]>([]);

  const addCsvItem = () => {
    const raw = inputText.trim();
    if (!raw) return;

    // Logic to separate metadata and links
    // Often format: "Title (SKU) Cost https://..."
    const linkIndex = raw.search(/https?:\/\//);
    let meta = (linkIndex === -1) ? raw : raw.substring(0, linkIndex).trim();
    let linksPart = (linkIndex === -1) ? "" : raw.substring(linkIndex);

    let title = meta;
    let sku = "";
    let cost = "1";

    // Extract Cost (digits at the end of the meta string)
    const costMatch = meta.match(/\s+([\d\.]+)$/);
    if (costMatch && costMatch.index !== undefined) {
      cost = costMatch[1];
      title = title.substring(0, costMatch.index).trim();
    }

    // Extract SKU (text inside parenthesis at the end of the title)
    const skuMatch = title.match(/\((.*?)\)$/);
    if (skuMatch && skuMatch.index !== undefined) {
      sku = skuMatch[1];
      title = title.substring(0, skuMatch.index).trim();
    }

    const finalTitle = sku ? `${title} (${sku})` : title;

    // Extract and process links
    const urlRegex = /https?:\/\/[^\s,]+/g;
    let cleanLinks: string[] = [];
    // Fix: Explicitly type foundLinks as string[] to prevent it from being inferred as never[] when match returns null
    const foundLinks: string[] = linksPart.match(urlRegex) || [];
    
    foundLinks.forEach(l => {
      let id = "";
      // Match Google Drive Patterns
      const m1 = l.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const m2 = l.match(/id=([a-zA-Z0-9_-]+)/);
      
      if (m1) id = m1[1];
      else if (m2) id = m2[1];

      if (id) {
        cleanLinks.push(`https://drive.google.com/uc?export=view&id=${id}`);
      } else {
        // Fallback if not a recognized google drive link structure but still a link?
        // For this specific app, usually we just want the converted drive links.
        // We can optionally push original if not drive, but requirement focuses on drive conversion.
        // Let's stick to only valid drive ID extraction to be safe, or push original if you want.
        // Based on prototype, it pushes only valid drive conversions.
      }
    });

    // Ensure 8 link slots (as per CSV spec in prototype)
    while (cleanLinks.length < 8) cleanLinks.push("");
    // Truncate if more
    cleanLinks = cleanLinks.slice(0, 8);

    const newItem: CsvItem = {
      id: Date.now().toString(),
      title: finalTitle,
      sku,
      cost,
      links: cleanLinks
    };

    setCsvItems(prev => [...prev, newItem]);
    setInputText('');
  };

  const removeCsvItem = (id: string) => {
    setCsvItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCsvList = () => {
    if (window.confirm("Clear the entire Scroll?")) {
      setCsvItems([]);
    }
  };

  const exportCSV = () => {
    if (csvItems.length === 0) {
      alert("Scroll is empty!");
      return;
    }

    // Header
    let content = "Category,Sub Category,Title,Description,Quantity,Type,Price,Shipping Profile,Offerable,Hazmat,Condition,Cost Per Item,SKU,Image URL 1,Image URL 2,Image URL 3,Image URL 4,Image URL 5,Image URL 6,Image URL 7,Image URL 8\n";

    // Rows
    csvItems.forEach(item => {
      // Escape double quotes in title
      const safeTitle = `"${item.title.replace(/"/g, '""')}"`;
      
      const row = [
        CSV_CONSTANTS.category,
        CSV_CONSTANTS.subCategory,
        safeTitle,
        CSV_CONSTANTS.description,
        CSV_CONSTANTS.quantity,
        CSV_CONSTANTS.type,
        CSV_CONSTANTS.price,
        CSV_CONSTANTS.shipping,
        CSV_CONSTANTS.offerable,
        CSV_CONSTANTS.hazmat,
        CSV_CONSTANTS.condition,
        item.cost,
        item.sku,
        ...item.links
      ];
      content += row.join(",") + "\n";
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, `LUSH_MASTER_${Date.now()}.csv`);
  };

  return (
    <div>
       <h2 className="font-marker text-3xl mb-4 border-l-[10px] border-ink pl-4 text-ink flex flex-col">
          DATA GENERATOR
          <span className="font-sans text-sm opacity-60 font-bold mt-1">Style: JIN // Precise & Clean</span>
        </h2>

        <div className="mb-4">
           <label className="block font-black text-sm uppercase mb-2">PASTE DATA STREAM (一键粘贴):</label>
           <textarea
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             placeholder="Example: Gucci Bag (LG25) 350 https://drive.google.com/..."
             className="w-full h-32 p-3 border-[3px] border-ink bg-white font-marker text-xl shadow-hard-white focus:outline-none focus:border-mugen transition-colors resize-none"
           />
        </div>

        <button
          onClick={addCsvItem}
          className="w-full sm:w-auto px-8 py-3 bg-sunflower text-ink border-[3px] border-ink font-marker text-xl shadow-hard-sm hover:shadow-hard-hover hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-hard-active active:translate-x-[2px] active:translate-y-[2px] transition-all flex justify-center items-center gap-2 mb-8"
        >
          <Plus className="w-6 h-6" /> ADD TO SCROLL
        </button>

        <div className="border-t-[4px] border-ink pt-6">
           <div className="flex justify-between items-center mb-4">
              <label className="block font-black text-lg uppercase">
                COLLECTED ITEMS: <span className="text-mugen text-2xl ml-2">{csvItems.length}</span>
              </label>
              {csvItems.length > 0 && (
                <button 
                  onClick={clearCsvList}
                  className="bg-white text-ink text-xs font-bold px-3 py-1 border-2 border-ink shadow-[3px_3px_0px_#111] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#111] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> RESET
                </button>
              )}
           </div>

           <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 border-b-[4px] border-ink pb-6 mb-6">
              {csvItems.length === 0 ? (
                 <div className="text-center p-10 opacity-40 font-marker text-xl border-2 border-dashed border-gray-300">
                   Scroll is empty.
                 </div>
              ) : (
                csvItems.map((item, idx) => (
                  <div key={item.id} className="bg-white border-[2px] border-ink p-4 shadow-hard-white flex justify-between items-start animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex-1 pr-4">
                      <div className="font-bold text-lg text-jin leading-tight mb-2">{item.title}</div>
                      <div className="flex flex-wrap gap-2">
                         {item.sku && <span className="bg-sunflower px-2 py-0.5 text-xs font-black border border-ink">SKU: {item.sku}</span>}
                         <span className="bg-mugen text-white px-2 py-0.5 text-xs font-black border border-ink">${item.cost}</span>
                         <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-bold border border-gray-300">{item.links.filter(l => l).length} Links</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeCsvItem(item.id)}
                      className="text-gray-400 hover:text-mugen transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
           </div>

           <button
            onClick={exportCSV}
            className="w-full p-4 bg-jin text-white border-[3px] border-ink font-marker text-2xl shadow-hard-sm hover:shadow-hard-hover hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-hard-active active:translate-x-[2px] active:translate-y-[2px] transition-all flex justify-center items-center gap-2"
          >
            <Download className="w-6 h-6" /> EXPORT CSV FILE
          </button>
        </div>
    </div>
  );
};
