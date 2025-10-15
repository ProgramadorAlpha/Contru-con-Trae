import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Scan, 
  FileText, 
  Search, 
  Download, 
  Upload,
  Eye,
  Settings,
  Languages,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Document, OCRResult } from '@/types/documents';

interface DocumentOCRProps {
  document: Document;
  onOCRComplete?: (result: OCRResult) => void;
}

const DocumentOCR: React.FC<DocumentOCRProps> = ({ 
  document, 
  onOCRComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOCRResult] = useState<OCRResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{text: string, confidence: number, page: number}>>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'kor', name: 'Korean' },
    { code: 'ara', name: 'Arabic' },
    { code: 'rus', name: 'Russian' }
  ];

  const mockOCRResult: OCRResult = {
    id: `ocr_${Date.now()}`,
    documentId: document.id,
    extractedText: `CONTRACT FOR CONSTRUCTION SERVICES

This Construction Contract ("Contract") is entered into as of January 15, 2024, by and between:

CLIENT: ABC Corporation, a Delaware corporation ("Client")
CONTRACTOR: XYZ Construction LLC, a California limited liability company ("Contractor")

PROJECT DESCRIPTION:
The Contractor agrees to provide construction services for the new office building located at 123 Main Street, San Francisco, CA 94105.

PROJECT TIMELINE:
- Start Date: February 1, 2024
- Completion Date: August 31, 2024
- Total Project Duration: 7 months

PAYMENT TERMS:
Total Contract Value: $2,500,000 USD
Payment Schedule:
- 20% upon contract signing: $500,000
- 40% at 50% completion: $1,000,000
- 40% upon final completion: $1,000,000

SCOPE OF WORK:
The Contractor shall provide all labor, materials, equipment, and services necessary for the completion of the project including but not limited to:
1. Site preparation and excavation
2. Foundation construction
3. Structural framework
4. Electrical and plumbing systems
5. Interior finishing
6. Final cleanup and site restoration

This contract is subject to all applicable laws and regulations.`,
    confidence: 0.94,
    processingTime: 3.2,
    language: selectedLanguage,
    pageCount: 1,
    textBlocks: [
      { text: 'CONTRACT FOR CONSTRUCTION SERVICES', confidence: 0.98, page: 1, x: 50, y: 50, width: 400, height: 30 },
      { text: 'This Construction Contract ("Contract") is entered into as of January 15, 2024', confidence: 0.96, page: 1, x: 50, y: 100, width: 500, height: 20 },
      { text: 'CLIENT: ABC Corporation', confidence: 0.99, page: 1, x: 50, y: 150, width: 200, height: 20 },
      { text: 'CONTRACTOR: XYZ Construction LLC', confidence: 0.97, page: 1, x: 50, y: 170, width: 250, height: 20 },
      { text: 'Total Contract Value: $2,500,000 USD', confidence: 0.95, page: 1, x: 50, y: 300, width: 300, height: 20 }
    ],
    metadata: {
      engine: 'Tesseract 5.3.0',
      dpi: 300,
      preprocessing: ['deskew', 'denoise', 'contrast enhancement'],
      postprocessing: ['spell check', 'format correction']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const processOCR = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate OCR processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    setTimeout(() => {
      setOCRResult(mockOCRResult);
      setIsProcessing(false);
      onOCRComplete?.(mockOCRResult);
    }, 3500);
  };

  const searchInText = () => {
    if (!ocrResult || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{text: string, confidence: number, page: number}> = [];
    
    ocrResult.textBlocks.forEach(block => {
      if (block.text.toLowerCase().includes(query)) {
        results.push({
          text: block.text,
          confidence: block.confidence,
          page: block.page
        });
      }
    });

    setSearchResults(results);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate processing uploaded file
      processOCR();
    }
  };

  const copyTextToClipboard = async () => {
    if (ocrResult?.extractedText) {
      await navigator.clipboard.writeText(ocrResult.extractedText);
    }
  };

  const downloadText = () => {
    if (ocrResult?.extractedText) {
      const blob = new Blob([ocrResult.extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.name}_ocr.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            OCR Document Processing
          </CardTitle>
          <CardDescription>
            Extract text from documents using advanced OCR technology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Info */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Current Document</h4>
              <Badge variant="outline">{document.type}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{document.name}</p>
            <p className="text-xs text-gray-500">Size: {(document.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          {/* OCR Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">Recognition Language</Label>
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-gray-500" />
                  <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                    disabled={isProcessing}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Processing Options</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={processOCR}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Start OCR
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing document with OCR...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="advanced-ocr"
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="advanced-ocr" className="text-sm">
                Enable advanced OCR settings
              </Label>
            </div>
          </div>

          {/* Search Functionality */}
          {ocrResult && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search in extracted text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && searchInText()}
                  />
                </div>
                <Button onClick={searchInText} disabled={!searchQuery.trim()}>
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-blue-50">
                        <p className="text-sm font-medium">{result.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Page {result.page}
                          </Badge>
                          <Badge 
                            variant={result.confidence >= 0.9 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {(result.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OCR Results */}
          {ocrResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Extracted Text</h4>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {(ocrResult.confidence * 100).toFixed(1)}% confidence
                  </Badge>
                  <Badge variant="outline">
                    {ocrResult.processingTime}s processing time
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <Textarea
                  value={ocrResult.extractedText}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />

                <div className="flex gap-2">
                  <Button onClick={copyTextToClipboard} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                  <Button onClick={downloadText} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Text
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Overlay
                  </Button>
                </div>
              </div>

              {/* Text Blocks Details */}
              <div className="space-y-2">
                <h4 className="font-medium">Text Blocks Analysis</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {ocrResult.textBlocks.map((block, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Block {index + 1}</span>
                        <Badge 
                          variant={block.confidence >= 0.9 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {(block.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{block.text}</p>
                      <div className="text-xs text-gray-500">
                        Position: ({block.x}, {block.y}) | Size: {block.width}x{block.height} | Page: {block.page}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Advanced OCR Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">OCR Engine:</span>
                      <p className="font-medium">{ocrResult.metadata.engine}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">DPI:</span>
                      <p className="font-medium">{ocrResult.metadata.dpi}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Preprocessing:</span>
                      <p className="font-medium">{ocrResult.metadata.preprocessing.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Postprocessing:</span>
                      <p className="font-medium">{ocrResult.metadata.postprocessing.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentOCR;