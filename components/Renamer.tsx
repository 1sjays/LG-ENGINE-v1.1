import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { StagedFile, ArchiveBatch } from '../types';
import { Trash2, Archive, Download, Upload, Image as ImageIcon } from 'lucide-react';

export const Renamer: React.FC = () => {
  const [sku, setSku] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [archives, setArchives] = useState<ArchiveBatch[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: StagedFile[] = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ file: f }));
    
    setStagedFiles(prev => [...prev, ...newFiles]);
  };

  const clearStaged = () => {
    setStagedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const transformBatch = () => {
    const trimmedSku = sku.trim();
    if (!trimmedSku) {
      alert("Please enter a SKU Code!");
      return;
    }
    if (stagedFiles.length === 0) {
      alert("Please drop some images first!");
      return;
    }

    const processed = stagedFiles.map((sf, index) => {
      const ext = sf.file.name.split('.').pop() || 'jpg';
      return {
        original: sf.file,
        newName: `${trimmedSku} ${index + 1}.${ext}`
      };
    });

    const newBatch: ArchiveBatch = {
      id: Date.now().toString(),
      sku: trimmedSku,
      files: processed,
      timestamp: Date.now()
    };

    setArchives(prev => [newBatch, ...prev]);
    setSku('');
    clearStaged();
  };

  const removeBatch = (id: string) => {
    setArchives(prev => prev.filter(b => b.id !== id));
  };

  const downloadBatchZip = async (batch: ArchiveBatch) => {
     const zip = new JSZip();
     batch.files.forEach(f => {
       zip.file(f.newName, f.original);
     });
     const content = await zip.generateAsync({ type: "blob" });
     FileSaver.saveAs(content, `LUSH_${batch.sku}.zip`);
  }

  const downloadAllImages = async () => {
    if (archives.length === 0) return;
    const zip = new JSZip();
    archives.forEach(batch => {
      const folder = zip.folder(batch.sku);
      if (folder) {
        batch.files.forEach(f => {
          folder.file(f.newName, f.original);
        });
      }
    });
    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, `LUSH_ARCHIVE_MASTER_${Date.now()}.zip`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-[#fdfdfd] border-[3px] border-ink p-6 shadow-hard-white">
      <div className="flex-1">
        <div className="mb-6">
          <label className="block font-black text-sm uppercase mb-2">1. SKU CODE (产品编号)</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="LG-25"
            className="w-full p-4 border-[3px] border-ink bg-white font-marker text-2xl shadow-hard-white focus:outline-none focus:border-jin transition-colors"
          />
        </div>

        <div className="mb-2 flex justify-between items-end">
          <label className="block font-black text-sm uppercase">2. BATCH IMAGES (改名图集)</label>
          {stagedFiles.length > 0 && (
            <button onClick={clearStaged} className="bg-white text-ink text-xs font-bold px-3 py-1 border-2 border-ink shadow-[2px_2px_0px_#111]">CLEAR</button>
          )}
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-4 border-dashed border-ink h-[250px] flex flex-col justify-center items-center cursor-pointer transition-all
            ${isDragOver ? 'bg-sunflower border-solid' : 'bg-paper/20'}
          `}
        >
          {stagedFiles.length === 0 ? (
            <div className="pointer-events-none opacity-40 text-center">
              <Upload className="w-12 h-12 mx-auto mb-2" />
              <div className="font-marker text-2xl">DROP FILES HERE</div>
            </div>
          ) : (
            <div className="w-full h-full p-4 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-2 content-start">
              {stagedFiles.map((_, i) => (
                <div key={i} className="aspect-square bg-ink text-sunflower rounded-full flex items-center justify-center font-marker text-sm border-2 border-white">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>

        <button
          onClick={transformBatch}
          className="w-full mt-6 p-5 bg-jin text-white border-[3px] border-ink font-marker text-2xl shadow-hard-sm hover:shadow-hard-hover hover:-translate-y-0.5 active:shadow-hard-active active:translate-y-0.5 transition-all flex justify-center items-center gap-2"
        >
          <ImageIcon className="w-7 h-7" /> LOCK & RENAMER
        </button>
      </div>

      <div className="lg:w-[350px] bg-paper/10 border-[3px] border-ink p-4 flex flex-col">
        <label className="block font-black text-sm uppercase mb-4 border-b-2 border-ink pb-2 italic">ARCHIVE (已就绪)</label>
        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3">
          {archives.length === 0 ? (
            <div className="text-center p-8 opacity-30 flex flex-col items-center">
              <Archive className="w-10 h-10 mb-2" />
              <span className="font-marker">EMPTY</span>
            </div>
          ) : (
            archives.map((batch) => (
              <div key={batch.id} className="bg-white border-2 border-ink p-3 shadow-sm flex justify-between items-center group">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="font-bold font-marker truncate text-lg leading-none">{batch.sku}</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{batch.files.length} PICS</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => downloadBatchZip(batch)} className="p-1 hover:text-jin"><Download className="w-5 h-5" /></button>
                  <button onClick={() => removeBatch(batch.id)} className="p-1 hover:text-mugen"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={downloadAllImages}
          disabled={archives.length === 0}
          className="w-full mt-4 p-3 bg-mugen text-white border-[3px] border-ink font-marker text-lg shadow-hard-sm disabled:opacity-50 transition-all flex justify-center items-center gap-2"
        >
          <Download className="w-5 h-5" /> ZIP ALL
        </button>
      </div>
    </div>
  );
};