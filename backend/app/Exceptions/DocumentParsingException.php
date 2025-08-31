<?php

namespace App\Exceptions;

use Exception;

class DocumentParsingException extends Exception
{
    public function __construct(string $message = "", int $code = 0, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }

    public function render()
    {
        return response()->json([
            'message' => 'Document parsing failed',
            'error' => $this->getMessage()
        ], 422);
    }
}