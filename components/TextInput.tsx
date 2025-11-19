import React, { useRef, useState, useEffect } from 'react';
import { Upload, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react';
// Import pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Set worker source to the CDN location
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
    // Reset value to allow re-uploading the same file if needed
    event.target.value = '';
  };

  const readPdfFile = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;

      // Limit pages to prevent browser freezing on massive books
      const maxPagesToRead = Math.min(totalPages, 50); // Read first 50 pages for safety demo
      
      for (let i = 1; i <= maxPagesToRead; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      if (totalPages > maxPagesToRead) {
        fullText += `\n\n[Đã dừng đọc sau ${maxPagesToRead} trang. Vui lòng cắt nhỏ file nếu cần đọc tiếp.]`;
      }

      return fullText;
    } catch (err) {
      console.error("PDF reading error", err);
      throw new Error("Không thể đọc file PDF. File có thể bị lỗi hoặc được bảo mật.");
    }
  };

  const processFile = async (file: File | undefined) => {
    setError(null);
    if (!file) return;

    setIsProcessingFile(true);

    try {
      // Simple validation
      const validTypes = ['text/plain', 'text/markdown', 'application/json', 'application/pdf', '']; 
      const validExtensions = ['.txt', '.md', '.srt', '.json', '.pdf'];
      
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
        throw new Error("Định dạng không hỗ trợ. Vui lòng dùng .txt, .md, .srt, hoặc .pdf");
      }

      let content = '';
      
      if (file.type === 'application/pdf' || extension === '.pdf') {
        content = await readPdfFile(file);
      } else {
        // Text files
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Lỗi đọc file text"));
          reader.readAsText(file);
        });
      }

      if (!content.trim()) {
        throw new Error("File rỗng hoặc không chứa văn bản đọc được.");
      }

      onChange(content);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi xử lý file");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearText = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-[300px] md:min-h-[400px] relative group">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-2">
           <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md,.srt,.json,.pdf"
            className="hidden"
          />
          <button
            onClick={triggerFileUpload}
            disabled={disabled || isProcessingFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            {isProcessingFile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>Tải file (PDF, TXT...)</span>
          </button>
        </div>

        {value && (
          <button
            onClick={clearText}
            disabled={disabled || isProcessingFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-100 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
            <span>Xóa</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-10 left-4 right-4 z-20 flex items-center p-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={14} className="mr-2" />
          {error}
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessingFile && (
        <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-indigo-600">
          <Loader2 size={32} className="animate-spin mb-2" />
          <p className="text-sm font-medium">Đang xử lý tài liệu...</p>
        </div>
      )}

      {/* Text Area Container */}
      <div 
        className={`flex-1 relative flex flex-col transition-all duration-200 ${dragActive ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <textarea
          className={`flex-1 w-full p-4 bg-slate-50 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-slate-700 leading-relaxed ${
             dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isProcessingFile}
          spellCheck={false}
        />
        
        {/* Drag Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-indigo-50/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-indigo-600 border-2 border-dashed border-indigo-300 pointer-events-none z-10">
            <FileText size={48} className="mb-2 animate-bounce" />
            <p className="font-medium">Thả file PDF hoặc Text vào đây</p>
          </div>
        )}

        {/* Character Count */}
        <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-200 shadow-sm pointer-events-none z-10">
          {value.length.toLocaleString()} ký tự
        </div>
      </div>
    </div>
  );
};