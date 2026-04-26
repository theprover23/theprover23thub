"use client";

import { useState, useRef } from "react";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  multiple?: boolean;
  accept?: string;
}

export default function ImageUploader({ onUpload, multiple = false, accept = "image/*" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError("");
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Только изображения разрешены");
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Файл слишком большой (макс. 5MB)");
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Ошибка загрузки");
        }

        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      
      if (multiple) {
        urls.forEach(url => onUpload(url));
      } else {
        onUpload(urls[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="btn btn-outline"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
      >
        {isUploading ? (
          <>Загрузка...</>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {multiple ? "Добавить изображения" : "Добавить изображение"}
          </>
        )}
      </button>
      {error && <p style={{ color: "#ef4444", marginTop: "8px", fontSize: "0.9rem" }}>{error}</p>}
    </div>
  );
}
