import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Upload, Search, CheckCircle, AlertCircle, Loader2, Copy } from 'lucide-react';

export const ProductIdentifier: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setOptions([]);
        setSelected(null);
        setCopiedText(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectOption = async (opt: string) => {
    setSelected(opt);
    try {
      await navigator.clipboard.writeText(opt);
      setCopiedText(opt);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const identifyProduct = async () => {
    if (!image) return;
    setLoading(true);
    setOptions([]);
    setSelected(null);
    setCopiedText(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
            {
              text: 'You are a luxury goods and commercial product expert. Identify exactly what product is in this image. Provide 3 likely commercial product names (including brand and model if possible). Return the result as a JSON array of strings only.',
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const result = JSON.parse(response.text);
      setOptions(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Identification failed:', err);
      alert('Failed to read the scroll. Try again, samurai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fff9ea] border-[3px] border-ink p-6 shadow-hard-white">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-4 border-dashed border-mugen h-[300px] flex flex-col justify-center items-center cursor-pointer transition-all relative overflow-hidden group
              ${image ? 'bg-white' : 'bg-white/50 hover:bg-mugen/5'}
            `}
          >
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-contain p-4 group-hover:scale-95 transition-transform" />
            ) : (
              <div className="text-center opacity-40 group-hover:opacity-60 transition-opacity">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <div className="font-marker text-2xl">DROP SAMPLE</div>
              </div>
            )}
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
          </div>

          <button
            onClick={identifyProduct}
            disabled={!image || loading}
            className={`
              w-full mt-4 p-4 bg-ink text-sunflower border-[3px] border-ink font-marker text-xl shadow-hard-sm transition-all flex justify-center items-center gap-3
              ${(!image || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-hard-hover hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-hard-active active:translate-x-[1px] active:translate-y-[1px]'}
            `}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
            {loading ? 'ANALYZING...' : 'AI IDENTIFY'}
          </button>
        </div>

        <div className="lg:w-[400px] flex flex-col">
          <div className="flex-1 space-y-3">
            {!options.length && !loading && (
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 opacity-30">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="font-marker text-center leading-tight">Name results will appear here</p>
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-gray-100 animate-pulse border-2 border-ink/10" />
                ))}
              </div>
            )}

            {options.map((opt, i) => (
              <div key={i} className="group relative">
                <button
                  onClick={() => handleSelectOption(opt)}
                  className={`
                    w-full text-left p-4 border-[3px] border-ink flex justify-between items-center transition-all
                    ${selected === opt ? 'bg-sunflower shadow-hard-sm' : 'bg-white hover:bg-paper'}
                  `}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-marker text-lg line-clamp-1">{opt}</span>
                    {copiedText === opt && (
                      <span className="text-[10px] bg-ink text-white px-1 font-bold animate-bounce uppercase">COPIED!</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selected === opt ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};