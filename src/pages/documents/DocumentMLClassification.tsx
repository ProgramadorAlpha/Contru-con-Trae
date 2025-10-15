import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  FileText, 
  Tag, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Upload,
  Settings,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Document, DocumentClassificationML } from '@/types/documents';

interface DocumentMLClassificationProps {
  document: Document;
  onClassificationUpdate?: (classification: DocumentClassificationML) => void;
}

const DocumentMLClassification: React.FC<DocumentMLClassificationProps> = ({ 
  document, 
  onClassificationUpdate 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<DocumentClassificationML | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [manualText, setManualText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Mock ML classification categories
  const categories = [
    'Contract',
    'Invoice',
    'Report',
    'Presentation',
    'Email',
    'Legal Document',
    'Technical Specification',
    'Financial Statement',
    'Marketing Material',
    'Human Resources'
  ];

  const mockClassification: DocumentClassificationML = {
    id: `ml_${Date.now()}`,
    documentId: document.id,
    predictedCategory: 'Contract',
    confidence: 0.87,
    allPredictions: [
      { category: 'Contract', confidence: 0.87 },
      { category: 'Legal Document', confidence: 0.08 },
      { category: 'Report', confidence: 0.03 },
      { category: 'Other', confidence: 0.02 }
    ],
    extractedKeywords: ['agreement', 'terms', 'conditions', 'party', 'obligation'],
    processingTime: 1.2,
    modelVersion: 'v2.1.0',
    trainingDataSize: 15000,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const analyzeDocument = async () => {
    setIsAnalyzing(true);
    setTrainingProgress(0);
    
    // Simulate ML analysis
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      setClassification(mockClassification);
      setConfidence(mockClassification.confidence);
      setIsAnalyzing(false);
      onClassificationUpdate?.(mockClassification);
    }, 2500);
  };

  const analyzeManualText = async () => {
    if (!manualText.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate text analysis
    setTimeout(() => {
      const manualClassification: DocumentClassificationML = {
        ...mockClassification,
        id: `ml_manual_${Date.now()}`,
        predictedCategory: 'Custom Analysis',
        confidence: 0.92,
        extractedKeywords: manualText.toLowerCase().split(' ').slice(0, 5),
        processingTime: 0.8
      };
      
      setClassification(manualClassification);
      setConfidence(manualClassification.confidence);
      setIsAnalyzing(false);
      onClassificationUpdate?.(manualClassification);
    }, 1500);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Document Classification
          </CardTitle>
          <CardDescription>
            Automatically classify documents using machine learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Preview */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Document Preview</h4>
              <Badge variant="outline">{document.type}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{document.name}</p>
            <p className="text-xs text-gray-500">Size: {(document.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          {/* Analysis Controls */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={analyzeDocument}
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing document...</span>
                  <span>{trainingProgress}%</span>
                </div>
                <Progress value={trainingProgress} className="h-2" />
              </div>
            )}
          </div>

          {/* Manual Text Analysis */}
          {showAdvanced && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium">Manual Text Analysis</h4>
              <Textarea
                placeholder="Paste text content here for analysis..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={analyzeManualText}
                disabled={isAnalyzing || !manualText.trim()}
                variant="outline"
                size="sm"
              >
                Analyze Text
              </Button>
            </div>
          )}

          {/* Classification Results */}
          {classification && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Classification Results</h4>
                  <Badge className={getConfidenceBadge(confidence)}>
                    {confidence >= 0.9 ? 'High' : confidence >= 0.7 ? 'Medium' : 'Low'} Confidence
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Predicted Category:</span>
                    <Badge variant="default" className="text-sm">
                      <Tag className="h-3 w-3 mr-1" />
                      {classification.predictedCategory}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Confidence Score:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={confidence * 100} className="flex-1" />
                      <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                        {(confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">All Predictions:</span>
                    <div className="space-y-1">
                      {classification.allPredictions.map((pred, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{pred.category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${pred.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-gray-600 w-12 text-right">
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Extracted Keywords:</span>
                    <div className="flex flex-wrap gap-2">
                      {classification.extractedKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Details */}
              {showAdvanced && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Model Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Model Version:</span>
                      <p className="font-medium">{classification.modelVersion}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Training Data Size:</span>
                      <p className="font-medium">{classification.trainingDataSize.toLocaleString()} samples</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Processing Time:</span>
                      <p className="font-medium">{classification.processingTime}s</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <p className="font-medium">{classification.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {classification && (
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Classification
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Refine Categories
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Train Model
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};