import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, CircularProgress, Alert, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Switch, FormControlLabel, TextField, Snackbar
} from '@mui/material';
import { useLanguage, useDarkMode } from '../stores/hooks';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { parseError, logError } from '../utils/errorHandler';

/**
 * TestCoverageAnalysis - AI-powered test coverage analysis component
 * 
 * This component can work in two modes:
 * 1. Standalone: User uploads/inputs requirements and test cases manually
 * 2. Integrated: Receives requirements and test cases from parent (GenerateTestsPage)
 * 
 * @param {Object} props
 * @param {Array} props.initialRequirements - Requirements passed from parent component
 * @param {Array} props.initialTestCases - Test cases passed from parent component
 * @param {string} props.selectedModel - AI model to use (gpt-4, gemini-pro, etc.)
 * @param {Function} props.onAnalysisComplete - Callback when analysis is complete
 */
function TestCoverageAnalysis({ 
  initialRequirements = null, 
  initialTestCases = null,
  selectedModel = 'gpt-4o-mini',
  onAnalysisComplete = null
}) {
  const { language } = useLanguage();
  const { isDarkMode } = useDarkMode();
  
  const [requirements, setRequirements] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [loading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [traceabilityMatrix, setTraceabilityMatrix] = useState([]);
  const [coverageStats, setCoverageStats] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [coverageHeatmap, setCoverageHeatmap] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [testMetrics, setTestMetrics] = useState({});
  const [selectedReq, setSelectedReq] = useState(null);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [requirementsText, setRequirementsText] = useState('');
  const [testCasesText, setTestCasesText] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Load initial data from props if provided
  useEffect(() => {
    if (initialRequirements && initialRequirements.length > 0) {
      setRequirements(initialRequirements);
      setRequirementsText(JSON.stringify(initialRequirements, null, 2));
    }
    if (initialTestCases && initialTestCases.length > 0) {
      setTestCases(initialTestCases);
      setTestCasesText(JSON.stringify(initialTestCases, null, 2));
    }
    // Auto-analyze if both props are provided
    if (initialRequirements?.length > 0 && initialTestCases?.length > 0) {
      // Defer the analyze call to avoid the dependency issue
      const timer = setTimeout(() => {
        analyzeWithAI(initialRequirements, initialTestCases);
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRequirements, initialTestCases]);

  // Parse text input to JSON
  const parseInputToJSON = (text, type) => {
    try {
      // Try to parse as JSON first
      return JSON.parse(text);
    } catch (e) {
      // If not JSON, try to parse as simple list
      const lines = text.split('\n').filter(line => line.trim());
      return lines.map((line, idx) => {
        const parts = line.split(':').map(p => p.trim());
        if (type === 'requirements') {
          return {
            id: parts[0] || `REQ-${String(idx + 1).padStart(3, '0')}`,
            title: parts[1] || line,
            description: parts[2] || '',
            priority: parts[3] || 'medium'
          };
        } else {
          return {
            id: parts[0] || `TC-${String(idx + 1).padStart(3, '0')}`,
            title: parts[1] || line,
            requirement: parts[2] || '',
            status: 'pending'
          };
        }
      });
    }
  };

  // AI-powered coverage analysis
  const analyzeWithAI = async (reqs = null, tests = null) => {
    const requirementsData = reqs || requirements;
    const testCasesData = tests || testCases;

    if (!requirementsData.length || !testCasesData.length) {
      setError(language === 'pt-BR' 
        ? 'Por favor, forneça requisitos e casos de teste para análise.' 
        : 'Please provide requirements and test cases for analysis.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
      // Determine which endpoint to use based on model
      const isGemini = selectedModel.toLowerCase().includes('gemini');
      const endpoint = isGemini 
        ? `${backendUrl}/api/analyze-coverage?token=${encodeURIComponent(process.env.REACT_APP_GEMINI_API_KEY || '')}`
        : `${backendUrl}/api/analyze-coverage`;

      const response = await axios.post(endpoint, {
        requirements: requirementsData,
        testCases: testCasesData,
        model: selectedModel,
        language: language
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes timeout for AI analysis
      });

      // Handle response - backend returns data directly or in data.data for Gemini
      const analysis = response.data.data || response.data;
      
      if (analysis) {
        // Update state with AI analysis results
        if (analysis.analysis) {
          setCoverageStats({
            totalRequirements: analysis.analysis.totalRequirements || requirementsData.length,
            coveredRequirements: analysis.analysis.coveredRequirements || 0,
            notCoveredRequirements: analysis.analysis.notCoveredRequirements || analysis.analysis.uncoveredRequirements || 0,
            coveragePercentage: analysis.analysis.coveragePercentage || 0,
            totalTests: analysis.analysis.totalTests || analysis.analysis.totalTestCases || testCasesData.length,
            passedTests: analysis.analysis.passedTests || 0,
            failedTests: analysis.analysis.failedTests || 0,
            pendingTests: analysis.analysis.pendingTests || 0,
            testSuccessRate: analysis.analysis.testSuccessRate || 0
          });
        }

        if (analysis.traceabilityMatrix) {
          // Map AI response format to component expected format
          const mappedMatrix = analysis.traceabilityMatrix.map(item => ({
            requirement: {
              id: item.requirementId || item.requirement?.id,
              title: item.requirementTitle || item.requirement?.title,
              description: item.requirementDescription || item.requirement?.description,
              priority: item.priority || item.requirement?.priority || 'medium'
            },
            requirementId: item.requirementId || item.requirement?.id,
            testCount: item.testCount || item.associatedTestCases?.length || 0,
            passedCount: item.passedCount || 0,
            coverage: item.coveragePercentage || item.coverage || 0,
            tests: item.tests || item.associatedTestCases?.map(tcId => ({ id: tcId, status: 'pending' })) || [],
            status: item.coverage_status || (item.coveragePercentage >= 80 ? 'covered' : item.coveragePercentage > 0 ? 'partial' : 'uncovered')
          }));
          setTraceabilityMatrix(mappedMatrix);
        } else {
          // Fallback to local calculation if AI didn't provide matrix
          const matrix = calculateTraceabilityMatrix(requirementsData, testCasesData);
          setTraceabilityMatrix(matrix);
        }

        if (analysis.recommendations) {
          // Map recommendations to expected format
          const mappedRecs = analysis.recommendations.map(rec => ({
            id: rec.id || `REC-${Math.random().toString(36).substr(2, 9)}`,
            type: rec.type,
            severity: rec.severity || rec.priority || 'medium',
            requirement: rec.requirement_id || rec.requirementId,
            message: rec.message || rec.description,
            suggestedTests: rec.suggested_tests || rec.suggestedTests
          }));
          setRecommendations(mappedRecs);
        }

        if (analysis.coverageHeatmap) {
          setCoverageHeatmap(analysis.coverageHeatmap);
        }

        if (analysis.testMetrics) {
          setTestMetrics(analysis.testMetrics);
        }

        setHasAnalyzed(true);
        setSuccess(language === 'pt-BR' 
          ? 'Análise de cobertura concluída com sucesso!' 
          : 'Coverage analysis completed successfully!');

        // Callback for parent component
        if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }
      }
    } catch (err) {
      logError('TestCoverageAnalysis AI analysis', err);
      const appError = parseError(err);
      
      // Fallback to local analysis on error
      setError(language === 'pt-BR' 
        ? `Erro na análise com IA: ${appError.message}. Usando análise local.` 
        : `AI analysis error: ${appError.message}. Using local analysis.`);
      
      // Perform local fallback analysis
      performLocalAnalysis(requirementsData, testCasesData);
    } finally {
      setAnalyzing(false);
    }
  };

  // Local fallback analysis (when AI is unavailable or disabled)
  const performLocalAnalysis = (reqs, tests) => {
    const matrix = calculateTraceabilityMatrix(reqs, tests);
    setTraceabilityMatrix(matrix);

    const stats = calculateCoverageStats(reqs, tests);
    setCoverageStats(stats);

    const recs = generateRecommendations(reqs, tests, matrix);
    setRecommendations(recs);
    
    setHasAnalyzed(true);
  };

  // Handle manual input submission
  const handleAnalyze = () => {
    try {
      const parsedReqs = parseInputToJSON(requirementsText, 'requirements');
      const parsedTests = parseInputToJSON(testCasesText, 'testCases');
      
      setRequirements(parsedReqs);
      setTestCases(parsedTests);

      if (aiAnalysisEnabled) {
        analyzeWithAI(parsedReqs, parsedTests);
      } else {
        performLocalAnalysis(parsedReqs, parsedTests);
      }
    } catch (err) {
      setError(language === 'pt-BR' 
        ? 'Erro ao processar entrada. Verifique o formato dos dados.' 
        : 'Error processing input. Please check the data format.');
    }
  };

  // Handle file upload
  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (type === 'requirements') {
        setRequirementsText(content);
        try {
          setRequirements(JSON.parse(content));
        } catch (err) {
          // Will be parsed on analyze
        }
      } else {
        setTestCasesText(content);
        try {
          setTestCases(JSON.parse(content));
        } catch (err) {
          // Will be parsed on analyze
        }
      }
    };
    reader.readAsText(file);
  };

  const calculateTraceabilityMatrix = (reqs, tests) => {
    return reqs.map(req => {
      const associatedTests = tests.filter(tc => 
        tc.requirement === req.id || 
        tc.requirementId === req.id ||
        (tc.requirements && tc.requirements.includes(req.id))
      );
      const passedTests = associatedTests.filter(tc => tc.status === 'passed' || tc.status === 'pass').length;
      const coverage = associatedTests.length > 0 ? (passedTests / associatedTests.length) * 100 : 0;
      
      return {
        requirement: req,
        requirementId: req.id,
        testCount: associatedTests.length,
        passedCount: passedTests,
        coverage: Math.round(coverage),
        tests: associatedTests,
        status: coverage >= 80 ? 'covered' : coverage >= 50 ? 'partial' : coverage > 0 ? 'low' : 'uncovered'
      };
    });
  };

  const calculateCoverageStats = (reqs, tests) => {
    const covered = reqs.filter(req => tests.some(tc => 
      tc.requirement === req.id || 
      tc.requirementId === req.id ||
      (tc.requirements && tc.requirements.includes(req.id))
    )).length;
    const notCovered = reqs.length - covered;
    const totalTests = tests.length;
    const passedTests = tests.filter(tc => tc.status === 'passed' || tc.status === 'pass').length;
    const failedTests = tests.filter(tc => tc.status === 'failed' || tc.status === 'fail').length;
    const pendingTests = tests.filter(tc => tc.status === 'pending' || tc.status === 'not-run').length;

    return {
      totalRequirements: reqs.length,
      coveredRequirements: covered,
      notCoveredRequirements: notCovered,
      coveragePercentage: reqs.length > 0 ? Math.round((covered / reqs.length) * 100) : 0,
      totalTests,
      passedTests,
      failedTests,
      pendingTests,
      testSuccessRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };
  };

  const generateRecommendations = (reqs, tests, matrix = null) => {
    const recs = [];
    const actualMatrix = matrix || calculateTraceabilityMatrix(reqs, tests);

    // Requisitos sem testes
    const uncovered = reqs.filter(req => !tests.some(tc => 
      tc.requirement === req.id || 
      tc.requirementId === req.id ||
      (tc.requirements && tc.requirements.includes(req.id))
    ));
    uncovered.forEach(req => {
      recs.push({
        id: `REC-${req.id}`,
        type: 'missing-tests',
        severity: 'high',
        requirement: req.id,
        message: language === 'pt-BR' 
          ? `Requisito "${req.title}" não tem casos de teste associados`
          : `Requirement "${req.title}" has no associated test cases`,
        suggestedTests: generateSuggestedTests(req)
      });
    });

    // Requisitos com baixa cobertura
    const lowCoverage = actualMatrix.filter(m => m.coverage < 50 && m.coverage > 0);
    lowCoverage.forEach(m => {
      recs.push({
        id: `REC-${m.requirement.id}-LOW`,
        type: 'low-coverage',
        severity: 'medium',
        requirement: m.requirement.id,
        message: language === 'pt-BR'
          ? `Requisito "${m.requirement.title}" tem cobertura baixa (${m.coverage}%)`
          : `Requirement "${m.requirement.title}" has low coverage (${m.coverage}%)`,
        coverage: m.coverage
      });
    });

    // Testes falhando
    const failingTests = tests.filter(tc => tc.status === 'failed' || tc.status === 'fail');
    if (failingTests.length > 0) {
      recs.push({
        id: 'REC-FAILING',
        type: 'failing-tests',
        severity: 'high',
        message: language === 'pt-BR'
          ? `${failingTests.length} teste(s) falhando - Investigação necessária`
          : `${failingTests.length} test(s) failing - Investigation required`,
        tests: failingTests
      });
    }

    return recs;
  };

  const generateSuggestedTests = (req) => {
    const suggestions = [];
    const isPortuguese = language === 'pt-BR';
    
    if (req.priority === 'high') {
      suggestions.push(isPortuguese 
        ? `CT: ${req.id} - Caminho feliz com dados válidos`
        : `TC: ${req.id} - Happy path with valid data`);
      suggestions.push(isPortuguese 
        ? `CT: ${req.id} - Validação de dados inválidos`
        : `TC: ${req.id} - Invalid data validation`);
      suggestions.push(isPortuguese 
        ? `CT: ${req.id} - Casos limites`
        : `TC: ${req.id} - Edge cases`);
    } else {
      suggestions.push(isPortuguese 
        ? `CT: ${req.id} - Funcionalidade básica`
        : `TC: ${req.id} - Basic functionality`);
    }
    
    return suggestions;
  };

  const getCoverageColor = (coverage) => {
    if (coverage >= 80) return '#4ade80';
    if (coverage >= 50) return '#fbbf24';
    if (coverage >= 20) return '#f97316';
    return '#ef4444';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
      case 'pass':
        return '#4ade80';
      case 'failed':
      case 'fail':
        return '#ef4444';
      case 'pending':
      case 'not-run':
        return '#fbbf24';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status) => {
    const isPortuguese = language === 'pt-BR';
    const labels = {
      'passed': isPortuguese ? 'Passou' : 'Passed',
      'pass': isPortuguese ? 'Passou' : 'Passed',
      'failed': isPortuguese ? 'Falhou' : 'Failed',
      'fail': isPortuguese ? 'Falhou' : 'Failed',
      'pending': isPortuguese ? 'Pendente' : 'Pending',
      'not-run': isPortuguese ? 'Não Executado' : 'Not Run'
    };
    return labels[status] || status;
  };

  const downloadReport = () => {
    const isPortuguese = language === 'pt-BR';
    const report = isPortuguese ? `
RELATÓRIO DE COBERTURA DE TESTES
================================
Data: ${new Date().toLocaleString('pt-BR')}
Modelo de IA: ${selectedModel}

ESTATÍSTICAS GERAIS
==================
Total de Requisitos: ${coverageStats.totalRequirements || 0}
Requisitos Cobertos: ${coverageStats.coveredRequirements || 0}
Requisitos Não Cobertos: ${coverageStats.notCoveredRequirements || 0}
Cobertura: ${coverageStats.coveragePercentage || 0}%

Total de Testes: ${coverageStats.totalTests || 0}
Testes Passando: ${coverageStats.passedTests || 0}
Testes Falhando: ${coverageStats.failedTests || 0}
Testes Pendentes: ${coverageStats.pendingTests || 0}
Taxa de Sucesso: ${coverageStats.testSuccessRate || 0}%

MATRIZ DE RASTREABILIDADE
=========================
${traceabilityMatrix.map(m => 
  `${m.requirement?.id || m.requirementId}: ${m.requirement?.title || 'N/A'} - ${m.coverage}% (${m.testCount} testes)`
).join('\n')}

RECOMENDAÇÕES
=============
${recommendations.map(rec => `- [${rec.severity?.toUpperCase() || 'INFO'}] ${rec.message || rec.description || rec}`).join('\n')}
    `.trim() : `
TEST COVERAGE REPORT
====================
Date: ${new Date().toLocaleString('en-US')}
AI Model: ${selectedModel}

GENERAL STATISTICS
==================
Total Requirements: ${coverageStats.totalRequirements || 0}
Covered Requirements: ${coverageStats.coveredRequirements || 0}
Uncovered Requirements: ${coverageStats.notCoveredRequirements || 0}
Coverage: ${coverageStats.coveragePercentage || 0}%

Total Tests: ${coverageStats.totalTests || 0}
Passing Tests: ${coverageStats.passedTests || 0}
Failing Tests: ${coverageStats.failedTests || 0}
Pending Tests: ${coverageStats.pendingTests || 0}
Success Rate: ${coverageStats.testSuccessRate || 0}%

TRACEABILITY MATRIX
===================
${traceabilityMatrix.map(m => 
  `${m.requirement?.id || m.requirementId}: ${m.requirement?.title || 'N/A'} - ${m.coverage}% (${m.testCount} tests)`
).join('\n')}

RECOMMENDATIONS
===============
${recommendations.map(rec => `- [${rec.severity?.toUpperCase() || 'INFO'}] ${rec.message || rec.description || rec}`).join('\n')}
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `coverage-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Show input form when no data
  const renderInputForm = () => {
    const isPortuguese = language === 'pt-BR';
    
    return (
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          overflow: 'hidden',
          backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
          mb: 4
        }}
      >
        <Box 
          sx={{ 
            background: isDarkMode ? '#0f1419' : 'linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%)',
            p: 3,
            borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <SmartToyIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
              {isPortuguese ? 'Dados para Análise' : 'Data for Analysis'}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch 
                checked={aiAnalysisEnabled} 
                onChange={(e) => setAiAnalysisEnabled(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                {isPortuguese ? 'Usar IA' : 'Use AI'}
              </Typography>
            }
          />
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                {isPortuguese ? 'Requisitos (JSON ou lista)' : 'Requirements (JSON or list)'}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder={isPortuguese 
                  ? `[{"id": "REQ-001", "title": "Login", "description": "...", "priority": "high"}]
ou
REQ-001: Login: Autenticação de usuário: high`
                  : `[{"id": "REQ-001", "title": "Login", "description": "...", "priority": "high"}]
or
REQ-001: Login: User authentication: high`}
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? '#0f1419' : '#f8f9fa',
                    color: isDarkMode ? '#d1d5db' : '#1e293b',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  component="label"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  variant="outlined"
                >
                  {isPortuguese ? 'Upload JSON' : 'Upload JSON'}
                  <input
                    type="file"
                    hidden
                    accept=".json,.txt"
                    onChange={(e) => handleFileUpload(e, 'requirements')}
                  />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                {isPortuguese ? 'Casos de Teste (JSON ou lista)' : 'Test Cases (JSON or list)'}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder={isPortuguese 
                  ? `[{"id": "TC-001", "title": "Login válido", "requirement": "REQ-001", "status": "passed"}]
ou
TC-001: Login válido: REQ-001: passed`
                  : `[{"id": "TC-001", "title": "Valid login", "requirement": "REQ-001", "status": "passed"}]
or
TC-001: Valid login: REQ-001: passed`}
                value={testCasesText}
                onChange={(e) => setTestCasesText(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? '#0f1419' : '#f8f9fa',
                    color: isDarkMode ? '#d1d5db' : '#1e293b',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  component="label"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  variant="outlined"
                >
                  {isPortuguese ? 'Upload JSON' : 'Upload JSON'}
                  <input
                    type="file"
                    hidden
                    accept=".json,.txt"
                    onChange={(e) => handleFileUpload(e, 'testCases')}
                  />
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <SmartToyIcon />}
              onClick={handleAnalyze}
              disabled={analyzing || (!requirementsText.trim() && !testCasesText.trim())}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              {analyzing 
                ? (isPortuguese ? 'Analisando...' : 'Analyzing...') 
                : (isPortuguese ? 'Analisar Cobertura' : 'Analyze Coverage')}
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !hasAnalyzed) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const isPortuguese = language === 'pt-BR';

  return (
    <Box sx={{ minHeight: '100vh', background: isDarkMode ? '#0f1419' : 'linear-gradient(135deg, #f5f7fa 0%, #f0f3f7 100%)', py: 4 }}>
      <Box p={{xs: 2, sm: 3, md: 6}} maxWidth={1400} margin="0 auto">
        {/* Notifications */}
        <Snackbar 
          open={!!success} 
          autoHideDuration={4000} 
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
        </Snackbar>
        <Snackbar 
          open={!!error && hasAnalyzed} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="warning" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>

        {/* Header Hero */}
        <Paper 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            p: 4, 
            mb: 5, 
            borderRadius: 3,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            <TrendingUpIcon sx={{ fontSize: 36 }} />
            <Typography variant="h3" fontWeight={800}>
              {isPortuguese ? 'Análise de Cobertura de Testes' : 'Test Coverage Analysis'}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.95 }}>
            {isPortuguese 
              ? 'Matriz de rastreabilidade, heatmap de cobertura e recomendações automáticas com IA'
              : 'Traceability matrix, coverage heatmap and AI-powered recommendations'}
          </Typography>
          {aiAnalysisEnabled && (
            <Chip 
              icon={<SmartToyIcon sx={{ color: 'white !important' }} />}
              label={`${isPortuguese ? 'Modelo' : 'Model'}: ${selectedModel}`}
              sx={{ mt: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              variant="outlined"
            />
          )}
        </Paper>

        {/* Input Form - Show when no analysis yet or when user wants to re-analyze */}
        {!hasAnalyzed && !initialRequirements && renderInputForm()}

        {/* Show re-analyze button when data exists */}
        {hasAnalyzed && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => setHasAnalyzed(false)}
              variant="outlined"
            >
              {isPortuguese ? 'Nova Análise' : 'New Analysis'}
            </Button>
            <Button
              startIcon={analyzing ? <CircularProgress size={16} /> : <SmartToyIcon />}
              onClick={() => analyzeWithAI()}
              disabled={analyzing}
              variant="contained"
              sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              {isPortuguese ? 'Reanalisar com IA' : 'Re-analyze with AI'}
            </Button>
          </Box>
        )}

        {/* Stats Cards - Only show after analysis */}
        {hasAnalyzed && (
          <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#3b82f6' }}>
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>{isPortuguese ? 'Cobertura' : 'Coverage'}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                      {coverageStats.coveragePercentage || 0}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#4ade80' }}>
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>{isPortuguese ? 'Testes Passando' : 'Passing Tests'}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                      {coverageStats.passedTests || 0}/{coverageStats.totalTests || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#f97316' }}>
                    <WarningIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>{isPortuguese ? 'Falhando' : 'Failing'}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                      {coverageStats.failedTests || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#fbbf24' }}>
                    <WarningIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>{isPortuguese ? 'Pendentes' : 'Pending'}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                      {coverageStats.pendingTests || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}

        {/* Matriz de Rastreabilidade - Only show after analysis */}
        {hasAnalyzed && (
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
            mb: 4
          }}
        >
          <Box 
            sx={{ 
              background: isDarkMode ? '#0f1419' : 'linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%)',
              p: 3,
              borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
              {isPortuguese ? 'Matriz de Rastreabilidade' : 'Traceability Matrix'}
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => analyzeWithAI()}
              disabled={analyzing}
              size="small"
            >
              {isPortuguese ? 'Atualizar' : 'Refresh'}
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: isDarkMode ? '#0f1419' : '#f8f9fa', borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}` }}>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>{isPortuguese ? 'Requisito' : 'Requirement'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>{isPortuguese ? 'Prioridade' : 'Priority'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>{isPortuguese ? 'Casos de Teste' : 'Test Cases'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>{isPortuguese ? 'Cobertura' : 'Coverage'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>Heatmap</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {traceabilityMatrix.map((item, idx) => (
                  <TableRow 
                    key={item.requirement?.id || item.requirementId || idx}
                    sx={{ 
                      background: isDarkMode 
                        ? (idx % 2 === 0 ? '#1a202c' : '#0f1419')
                        : (idx % 2 === 0 ? '#ffffff' : '#f8f9fa'),
                      borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                      '&:hover': { background: isDarkMode ? '#232b33' : '#f0f4f8' },
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedReq(item)}
                  >
                    <TableCell sx={{ color: isDarkMode ? '#d1d5db' : '#1e293b', fontWeight: 600 }}>
                      {item.requirement?.id || item.requirementId}
                    </TableCell>
                    <TableCell sx={{ color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                      {item.requirement?.title || item.requirementTitle || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.requirement?.priority || item.priority || 'medium'} 
                        size="small"
                        color={(item.requirement?.priority || item.priority) === 'high' ? 'error' : (item.requirement?.priority || item.priority) === 'medium' ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ color: isDarkMode ? '#d1d5db' : '#1e293b', textAlign: 'center' }}>
                      {item.testCount || (item.tests?.length || 0)}
                    </TableCell>
                    <TableCell sx={{ color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.coverage || 0}
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: isDarkMode ? '#374151' : '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getCoverageColor(item.coverage || 0),
                              borderRadius: 4
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {item.coverage || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          width: 30, 
                          height: 30, 
                          borderRadius: 1,
                          backgroundColor: getCoverageColor(item.coverage || 0),
                          opacity: 0.7,
                          cursor: 'pointer'
                        }}
                        title={`${item.coverage || 0}% ${isPortuguese ? 'de cobertura' : 'coverage'}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        )}

        {/* Recomendações - Only show after analysis */}
        {hasAnalyzed && (
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
            mb: 4
          }}
        >
          <Box 
            sx={{ 
              background: isDarkMode ? '#0f1419' : 'linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%)',
              p: 3,
              borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <AutoFixHighIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                {isPortuguese ? 'Recomendações com IA' : 'AI Recommendations'} ({recommendations.length})
              </Typography>
            </Box>
            <Button
              startIcon={<DownloadIcon />}
              onClick={downloadReport}
              size="small"
            >
              {isPortuguese ? 'Exportar Relatório' : 'Export Report'}
            </Button>
          </Box>

          <Box sx={{ p: 3 }}>
            {recommendations.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <Card 
                    key={rec.id || idx}
                    sx={{ 
                      backgroundColor: isDarkMode ? '#0f1419' : '#f8f9fa',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                      borderLeft: `4px solid ${(rec.severity || rec.priority) === 'high' ? '#ef4444' : (rec.severity || rec.priority) === 'medium' ? '#fbbf24' : '#4ade80'}`
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Box sx={{ mt: 0.5 }}>
                          {(rec.severity || rec.priority) === 'high' && <ErrorIcon sx={{ color: '#ef4444' }} />}
                          {(rec.severity || rec.priority) === 'medium' && <WarningIcon sx={{ color: '#fbbf24' }} />}
                          {(rec.severity || rec.priority) === 'low' && <CheckCircleIcon sx={{ color: '#4ade80' }} />}
                        </Box>
                        <Box flex={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', mb: 1 }}>
                            {rec.message || rec.description || rec.title}
                          </Typography>
                          {rec.suggestedTests && (
                            <Box sx={{ mt: 1.5 }}>
                              <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: 600 }}>
                                {isPortuguese ? 'Testes Sugeridos:' : 'Suggested Tests:'}
                              </Typography>
                              {rec.suggestedTests.map((test, idx) => (
                                <Typography 
                                  key={idx}
                                  variant="caption" 
                                  sx={{ color: isDarkMode ? '#d1d5db' : '#475569', display: 'block', mt: 0.5 }}
                                >
                                  • {test}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                        <Chip 
                          label={(rec.severity || rec.priority || 'info').toUpperCase()} 
                          size="small"
                          color={(rec.severity || rec.priority) === 'high' ? 'error' : (rec.severity || rec.priority) === 'medium' ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                {recommendations.length > 5 && (
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#cbd5e1', textAlign: 'center' }}>
                    + {recommendations.length - 5} {isPortuguese ? 'recomendações não exibidas' : 'more recommendations'}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography sx={{ textAlign: 'center', color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                {isPortuguese ? 'Excelente! Não há recomendações pendentes.' : 'Excellent! No pending recommendations.'}
              </Typography>
            )}
          </Box>
        </Paper>
        )}
      </Box>

      {/* Dialog - Detalhes do Requisito */}
      <Dialog open={!!selectedReq} onClose={() => setSelectedReq(null)} maxWidth="sm" fullWidth>
        {selectedReq && (
          <>
            <DialogTitle sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#f5f7fa', color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
              {selectedReq.requirement?.id || selectedReq.requirementId} - {selectedReq.requirement?.title || selectedReq.requirementTitle || 'N/A'}
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#ffffff', mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                {isPortuguese ? 'Descrição:' : 'Description:'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? '#d1d5db' : '#475569' }}>
                {selectedReq.requirement?.description || selectedReq.description || (isPortuguese ? 'Sem descrição' : 'No description')}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                {isPortuguese ? 'Casos de Teste' : 'Test Cases'} ({selectedReq.testCount || selectedReq.tests?.length || 0}):
              </Typography>
              {(selectedReq.tests?.length > 0) ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedReq.tests.map((test, idx) => (
                    <Card 
                      key={test.id || idx}
                      sx={{ 
                        backgroundColor: isDarkMode ? '#1a202c' : '#f8f9fa',
                        borderLeft: `4px solid ${getStatusColor(test.status)}`
                      }}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                              {test.id || `TC-${idx + 1}`}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                              {test.title || test.name}
                            </Typography>
                          </Box>
                          <Chip 
                            label={getStatusLabel(test.status)} 
                            size="small"
                            sx={{ backgroundColor: getStatusColor(test.status), color: 'white' }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#cbd5e1' }}>
                  {isPortuguese ? 'Nenhum teste associado' : 'No associated tests'}
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#f5f7fa' }}>
              <Button onClick={() => setSelectedReq(null)}>{isPortuguese ? 'Fechar' : 'Close'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default TestCoverageAnalysis;
