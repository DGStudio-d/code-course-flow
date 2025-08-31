<?php

namespace App\DTOs;

use Carbon\Carbon;

class DocumentMetadata
{
    public function __construct(
        public string $originalName,
        public int $size,
        public string $mimeType,
        public int $wordCount,
        public Carbon $extractedAt
    ) {}

    public function toArray(): array
    {
        return [
            'original_name' => $this->originalName,
            'size' => $this->size,
            'mime_type' => $this->mimeType,
            'word_count' => $this->wordCount,
            'extracted_at' => $this->extractedAt->toISOString()
        ];
    }
}