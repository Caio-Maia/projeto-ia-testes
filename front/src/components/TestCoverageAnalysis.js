import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, CircularProgress, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, TextField, Snackbar
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ModelSelector from './ModelSelector';
import { AI_MODELS } from '../utils/aiModels';
import { useLanguage, useDarkMode, useTokens, useUI } from '../stores/hooks';
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
  const { language, t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const { getToken } = useTokens();
  const { dialogs } = useUI();
  
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
  const [localSelectedModel, setLocalSelectedModel] = useState(() => {
    return AI_MODELS.find(m => m.version === selectedModel) || AI_MODELS[0] || null;
  });
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

  // Normalize status to standard values
  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase().trim();
    // Passed variants (EN + PT)
    if (['passed', 'pass', 'success', 'ok', 'sucesso', 'aprovado', 'passou', 'passou'].includes(s)) {
      return 'passed';
    }
    // Failed variants (EN + PT)
    if (['failed', 'fail', 'error', 'failure', 'falha', 'falhou', 'erro', 'reprovado'].includes(s)) {
      return 'failed';
    }
    // Pending variants (EN + PT)
    if (['pending', 'not-run', 'skipped', 'todo', 'pendente', 'não executado', 'nao executado', 'aguardando'].includes(s)) {
      return 'pending';
    }
    return 'pending';
  };

  // Normalize identifiers for robust matching (REQ/TC ids, etc.)
  const normalizeIdentifier = (value) => String(value || '').toLowerCase().trim();

  // Build lookup map for test cases by id-like fields
  const buildTestCasesIndex = (tests = []) => {
    const index = new Map();
    tests.forEach((tc, idx) => {
      const keys = [tc?.id, tc?.testCaseId, tc?.code].filter(Boolean);
      keys.forEach((k) => {
        const nk = normalizeIdentifier(k);
        if (nk && !index.has(nk)) index.set(nk, tc);
      });
      // Fallback key to keep reference even when id is missing
      if (!keys.length) index.set(`__idx_${idx}`, tc);
    });
    return index;
  };

  // Enrich AI-returned test items with local test data (title/status), and normalize output shape
  const mapAndEnrichAssociatedTests = (rawTests = [], testsIndex = new Map()) => {
    const mapped = rawTests.map((raw, idx) => {
      if (typeof raw === 'string') {
        const local = testsIndex.get(normalizeIdentifier(raw));
        return {
          ...(local || {}),
          id: raw,
          title: local?.title || local?.name || local?.description || '',
          status: normalizeStatus(local?.status)
        };
      }

      const candidateId = raw?.id || raw?.testCaseId || raw?.code || `TC-${String(idx + 1).padStart(3, '0')}`;
      const local = testsIndex.get(normalizeIdentifier(candidateId));
      const merged = { ...(local || {}), ...(raw || {}) };

      return {
        ...merged,
        id: candidateId,
        title: merged?.title || merged?.name || merged?.description || local?.title || local?.name || '',
        status: normalizeStatus(merged?.status || local?.status)
      };
    });

    // Keep duplicates when user data has repeated IDs; only add display disambiguation.
    const occurrence = new Map();
    return mapped.map((tc, idx) => {
      const baseId = tc?.id || `TC-${String(idx + 1).padStart(3, '0')}`;
      const key = normalizeIdentifier(baseId) || `__idx_${idx}`;
      const count = (occurrence.get(key) || 0) + 1;
      occurrence.set(key, count);

      return {
        ...tc,
        id: baseId,
        displayId: count > 1 ? `${baseId} (${count})` : baseId
      };
    });
  };

  const generateFailureInvestigationSuggestions = (failingTests = []) => {
    const isPortuguese = language === 'pt-BR';
    const ids = failingTests
      .map(t => t?.id)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');

    if (isPortuguese) {
      return [
        `Reproduza a falha localmente${ids ? ` para ${ids}` : ''} e capture logs completos do cenário.`,
        'Compare resultado esperado vs. obtido e valide dados de entrada/fixtures.',
        'Verifique dependências externas (API, banco, filas), timeouts e intermitência.',
        'Analise mudanças recentes relacionadas ao requisito e execute testes impactados.',
        'Adicione logs/assertivas temporárias para isolar o ponto exato da falha.'
      ];
    }

    return [
      `Reproduce the failure locally${ids ? ` for ${ids}` : ''} and collect full logs.`,
      'Compare expected vs actual results and validate input data/fixtures.',
      'Check external dependencies (API, database, queues), timeouts, and flakiness.',
      'Review recent changes around the requirement and run impacted tests.',
      'Add temporary logs/assertions to isolate the exact failure point.'
    ];
  };

  // Parse text input to JSON
  const parseInputToJSON = (text, type) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(text);
      // Normalize status for test cases
      if (type === 'testCases' && Array.isArray(parsed)) {
        return parsed.map(tc => ({
          ...tc,
          status: normalizeStatus(tc.status)
        }));
      }
      return parsed;
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
          // TC-001: Login válido: REQ-001: passed
          return {
            id: parts[0] || `TC-${String(idx + 1).padStart(3, '0')}`,
            title: parts[1] || line,
            requirement: parts[2] || '',
            status: normalizeStatus(parts[3])
          };
        }
      });
    }
  };

  // AI-powered coverage analysis
  const analyzeWithAI = async (reqs = null, tests = null) => {
    const requirementsData = reqs || requirements;
    const testCasesData = tests || testCases;

    // Normalize selected model to the model object used across the app
    const modelObj = localSelectedModel && localSelectedModel.apiName
      ? localSelectedModel
      : (typeof selectedModel === 'object' && selectedModel?.apiName)
        ? selectedModel
        : AI_MODELS.find(m => m.version === (localSelectedModel?.version || selectedModel)) || AI_MODELS[0];
    const modelToUse = modelObj.version || modelObj;

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
      
      // Retrieve token: prefer persisted tokens store, fallback to legacy localStorage key and env vars
      const tokenFromStore = getToken ? getToken(modelObj.apiName) : null;
      const localToken = typeof window !== 'undefined'
        ? localStorage.getItem(`${modelObj.apiName}Token`)
        : null;
      const envToken = modelObj.apiName === 'gemini'
        ? process.env.REACT_APP_GEMINI_API_KEY
        : process.env.REACT_APP_CHATGPT_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
      const token = tokenFromStore || localToken || envToken;

      if (!token) {
        // Open token configuration dialog and show contextual error
        try { dialogs?.token?.show && dialogs.token.show(modelObj.apiName); } catch (e) {}
        setError(language === 'pt-BR'
          ? `Configure um token para ${modelObj.apiName === 'gemini' ? 'Gemini' : 'ChatGPT'} nas configurações ou defina a variável ${modelObj.apiName === 'gemini' ? 'REACT_APP_GEMINI_API_KEY' : 'REACT_APP_CHATGPT_API_KEY'}.`
          : `Please configure a token for ${modelObj.apiName === 'gemini' ? 'Gemini' : 'ChatGPT'} or set ${modelObj.apiName === 'gemini' ? 'REACT_APP_GEMINI_API_KEY' : 'REACT_APP_CHATGPT_API_KEY'}.`);
        return;
      }

      // Call backend route for the provider (same pattern as useAI hooks)
      const endpoint = `${backendUrl}/api/${modelObj.apiName}/analyze-coverage?token=${encodeURIComponent(token)}`;

      const response = await axios.post(endpoint, {
        requirements: requirementsData,
        testCases: testCasesData,
        model: modelObj.version || modelToUse,
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
        // Calculate local stats from input data as fallback
        const localStats = calculateCoverageStats(requirementsData, testCasesData);
        
        // Count suggested tests from AI recommendations for better coverage calculation
        const aiSuggestedTestsCount = analysis.recommendations
          ? analysis.recommendations.reduce((acc, rec) => {
              const suggested = rec.suggested_tests || rec.suggestedTests || [];
              return acc + suggested.length;
            }, 0)
          : 0;
        
        // Calculate real coverage considering missing tests
        const existingTests = testCasesData.length;
        const totalNeededTests = existingTests + aiSuggestedTestsCount;
        const realCoveragePercentage = totalNeededTests > 0 
          ? Math.round((existingTests / totalNeededTests) * 100) 
          : (requirementsData.length > 0 ? 0 : 100);
        
        // Update state with AI analysis results, using local fallback for missing values
        if (analysis.analysis || localStats) {
          const aiStats = analysis.analysis || {};
          setCoverageStats({
            totalRequirements: aiStats.totalRequirements || localStats.totalRequirements,
            coveredRequirements: aiStats.coveredRequirements || localStats.coveredRequirements,
            notCoveredRequirements: aiStats.notCoveredRequirements || aiStats.uncoveredRequirements || localStats.notCoveredRequirements,
            coveragePercentage: aiSuggestedTestsCount > 0 ? realCoveragePercentage : (aiStats.coveragePercentage || localStats.coveragePercentage),
            totalTests: aiStats.totalTests || aiStats.totalTestCases || localStats.totalTests,
            passedTests: aiStats.passedTests ?? localStats.passedTests,
            failedTests: aiStats.failedTests ?? localStats.failedTests,
            pendingTests: aiStats.pendingTests ?? localStats.pendingTests,
            testSuccessRate: aiStats.testSuccessRate || localStats.testSuccessRate,
            suggestedTestsCount: aiSuggestedTestsCount
          });
        }

        if (analysis.traceabilityMatrix) {
          const testCasesIndex = buildTestCasesIndex(testCasesData);
          // Map AI response format to component expected format
          const mappedMatrix = analysis.traceabilityMatrix.map(item => {
            const enrichedTests = mapAndEnrichAssociatedTests(
              (Array.isArray(item.tests) && item.tests.length > 0)
                ? item.tests
                : (item.associatedTestCases || []),
              testCasesIndex
            );

            return {
              ...(item || {}),
              tests: enrichedTests,
              requirement: {
              id: item.requirementId || item.requirement?.id,
              title: item.requirementTitle || item.requirement?.title,
              description: item.requirementDescription || item.requirement?.description,
              priority: item.priority || item.requirement?.priority || 'medium'
            },
            requirementId: item.requirementId || item.requirement?.id,
            testCount: enrichedTests.length || item.testCount || item.associatedTestCases?.length || item.tests?.length || 0,
            passedCount: item.passedCount || 0,
            coverage: item.coveragePercentage || item.coverage || 0,
            status: item.coverage_status || (item.coveragePercentage >= 80 ? 'covered' : item.coveragePercentage > 0 ? 'partial' : 'uncovered')
            };
          });
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
            tests: rec.tests || [],
            suggestedTests: (rec.suggested_tests || rec.suggestedTests) || (
              (rec.type === 'failing-tests' || rec.type === 'failing_test' || /falh|fail/i.test(rec.message || rec.description || ''))
                ? generateFailureInvestigationSuggestions(rec.tests || [])
                : undefined
            )
          }));
          setRecommendations(mappedRecs);
          
          // Recalculate coverage with suggested tests count
          const suggestedCount = mappedRecs.reduce((acc, rec) => {
            return acc + (rec.suggestedTests?.length || 0);
          }, 0);
          if (suggestedCount > 0) {
            const existingTests = testCasesData.length;
            const totalNeeded = existingTests + suggestedCount;
            const adjustedCoverage = Math.round((existingTests / totalNeeded) * 100);
            setCoverageStats(prev => ({
              ...prev,
              coveragePercentage: adjustedCoverage,
              suggestedTestsCount: suggestedCount
            }));
          }
        } else {
          // Generate local recommendations if AI didn't provide them
          const localRecs = generateRecommendations(requirementsData, testCasesData);
          setRecommendations(localRecs);
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
        ? `Erro na análise com IA: ${appError.getTranslatedMessage(t)}. Usando análise local.` 
        : `AI analysis error: ${appError.getTranslatedMessage(t)}. Using local analysis.`);
      
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

      // Always use AI analysis by default (local fallback happens on error)
      analyzeWithAI(parsedReqs, parsedTests);
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
      // Normalize requirement ID for comparison (case-insensitive, trimmed)
      const reqIdNormalized = (req.id || '').toLowerCase().trim();
      
      const associatedTests = tests.filter(tc => {
        // Check multiple possible requirement fields
        const tcReq = (tc.requirement || tc.requirementId || '').toLowerCase().trim();
        const tcReqs = tc.requirements || [];
        
        return tcReq === reqIdNormalized || 
               tcReqs.some(r => (r || '').toLowerCase().trim() === reqIdNormalized);
      });
      
      // Count by normalized status
      const passedTests = associatedTests.filter(tc => {
        const status = normalizeStatus(tc.status);
        return status === 'passed';
      }).length;
      
      const failedTests = associatedTests.filter(tc => {
        const status = normalizeStatus(tc.status);
        return status === 'failed';
      }).length;
      
      const pendingTests = associatedTests.filter(tc => {
        const status = normalizeStatus(tc.status);
        return status === 'pending';
      }).length;
      
      // Coverage = passed tests / total associated tests (if any tests exist)
      // If no tests, coverage is 0%
      const coverage = associatedTests.length > 0 
        ? (passedTests / associatedTests.length) * 100 
        : 0;
      
      // Map tests with normalized status for display
      const mappedTests = associatedTests.map(tc => ({
        ...tc,
        status: normalizeStatus(tc.status)
      }));
      
      return {
        requirement: req,
        requirementId: req.id,
        testCount: associatedTests.length,
        passedCount: passedTests,
        failedCount: failedTests,
        pendingCount: pendingTests,
        coverage: Math.round(coverage),
        tests: mappedTests,
        status: coverage >= 80 ? 'covered' : coverage >= 50 ? 'partial' : coverage > 0 ? 'low' : 'uncovered'
      };
    });
  };

  const calculateCoverageStats = (reqs, tests) => {
    // Helper para verificar se teste está associado ao requisito
    const isTestForReq = (tc, req) => {
      const reqIdNormalized = (req.id || '').toLowerCase().trim();
      const tcReq = (tc.requirement || tc.requirementId || '').toLowerCase().trim();
      const tcReqs = tc.requirements || [];
      return tcReq === reqIdNormalized || 
             tcReqs.some(r => (r || '').toLowerCase().trim() === reqIdNormalized);
    };
    
    const covered = reqs.filter(req => tests.some(tc => isTestForReq(tc, req))).length;
    const notCovered = reqs.length - covered;
    const totalTests = tests.length;
    
    // Count tests by normalized status
    const passedTests = tests.filter(tc => normalizeStatus(tc.status) === 'passed').length;
    const failedTests = tests.filter(tc => normalizeStatus(tc.status) === 'failed').length;
    const pendingTests = tests.filter(tc => normalizeStatus(tc.status) === 'pending').length;

    // Testes que realmente foram executados
    const executedTests = passedTests + failedTests;
    
    return {
      totalRequirements: reqs.length,
      coveredRequirements: covered,
      notCoveredRequirements: notCovered,
      coveragePercentage: reqs.length > 0 ? Math.round((covered / reqs.length) * 100) : 0,
      totalTests,
      passedTests,
      failedTests,
      pendingTests,
      executedTests,
      testSuccessRate: executedTests > 0 ? Math.round((passedTests / executedTests) * 100) : 0,
      suggestedTestsCount: 0
    };
  };

  const generateRecommendations = (reqs, tests, matrix = null) => {
    const recs = [];
    const actualMatrix = matrix || calculateTraceabilityMatrix(reqs, tests);

    // Helper para verificar se teste está associado ao requisito
    const isTestForReq = (tc, req) => {
      const reqIdNormalized = (req.id || '').toLowerCase().trim();
      const tcReq = (tc.requirement || tc.requirementId || '').toLowerCase().trim();
      const tcReqs = tc.requirements || [];
      return tcReq === reqIdNormalized || 
             tcReqs.some(r => (r || '').toLowerCase().trim() === reqIdNormalized);
    };

    // Requisitos sem testes
    const uncovered = reqs.filter(req => !tests.some(tc => isTestForReq(tc, req)));
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
    const failingTests = tests.filter(tc => normalizeStatus(tc.status) === 'failed');
    if (failingTests.length > 0) {
      recs.push({
        id: 'REC-FAILING',
        type: 'failing-tests',
        severity: 'high',
        message: language === 'pt-BR'
          ? `${failingTests.length} teste(s) falhando - Investigação necessária`
          : `${failingTests.length} test(s) failing - Investigation required`,
        tests: failingTests,
        suggestedTests: generateFailureInvestigationSuggestions(failingTests)
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
Modelo de IA: ${localSelectedModel?.label || localSelectedModel?.version || selectedModel}

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
AI Model: ${localSelectedModel?.label || localSelectedModel?.version || selectedModel}

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
          <Box sx={{ minWidth: 320 }}>
            <ModelSelector
              value={localSelectedModel}
              onChange={(e) => setLocalSelectedModel(e.target.value)}
              label={isPortuguese ? 'Modelo' : 'Model'}
              required={false}
            />
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{ 
              justifyContent: 'center',
              alignItems: 'stretch'
            }}
          >
            {/* Requirements Card */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  backgroundColor: isDarkMode ? 'rgba(15, 20, 25, 0.6)' : '#fafbfc',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                    boxShadow: isDarkMode 
                      ? '0 4px 20px rgba(59, 130, 246, 0.15)' 
                      : '0 4px 20px rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}
                  >
                    1
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: isDarkMode ? '#f3f4f6' : '#1e293b',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {isPortuguese ? 'Requisitos' : 'Requirements'}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isDarkMode ? '#9ca3af' : '#64748b', 
                    mb: 2,
                    lineHeight: 1.6
                  }}
                >
                  {isPortuguese 
                    ? 'Cole seus requisitos em formato JSON ou liste um por linha no formato: ID: Título: Descrição: Prioridade'
                    : 'Paste your requirements as JSON or list one per line in format: ID: Title: Description: Priority'}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={12}
                  maxRows={20}
                  placeholder={isPortuguese 
                    ? `Formato JSON:
[
  {
    "id": "REQ-001",
    "title": "Login de usuário",
    "description": "Sistema de autenticação",
    "priority": "high"
  }
]

Ou formato simples (um por linha):
REQ-001: Login: Autenticação de usuário: high
REQ-002: Dashboard: Painel principal: medium`
                    : `JSON format:
[
  {
    "id": "REQ-001",
    "title": "User login",
    "description": "Authentication system",
    "priority": "high"
  }
]

Or simple format (one per line):
REQ-001: Login: User authentication: high
REQ-002: Dashboard: Main panel: medium`}
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? '#0a0f14' : '#ffffff',
                      color: isDarkMode ? '#e5e7eb' : '#1e293b',
                      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      borderRadius: 2,
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                      '&:hover': {
                        borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6'
                      },
                      '&.Mui-focused': {
                        borderColor: '#3b82f6',
                        boxShadow: `0 0 0 3px ${isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    component="label"
                    size="medium"
                    startIcon={<UploadFileIcon />}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                      color: isDarkMode ? '#d1d5db' : '#475569',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
                      }
                    }}
                  >
                    {isPortuguese ? 'Importar JSON' : 'Import JSON'}
                    <input
                      type="file"
                      hidden
                      accept=".json,.txt"
                      onChange={(e) => handleFileUpload(e, 'requirements')}
                    />
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Test Cases Card */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  backgroundColor: isDarkMode ? 'rgba(15, 20, 25, 0.6)' : '#fafbfc',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: isDarkMode ? 'rgba(74, 222, 128, 0.5)' : '#4ade80',
                    boxShadow: isDarkMode 
                      ? '0 4px 20px rgba(74, 222, 128, 0.15)' 
                      : '0 4px 20px rgba(74, 222, 128, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}
                  >
                    2
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: isDarkMode ? '#f3f4f6' : '#1e293b',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {isPortuguese ? 'Casos de Teste' : 'Test Cases'}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isDarkMode ? '#9ca3af' : '#64748b', 
                    mb: 2,
                    lineHeight: 1.6
                  }}
                >
                  {isPortuguese 
                    ? 'Cole seus casos de teste em formato JSON ou liste um por linha no formato: ID: Título: Requisito: Status'
                    : 'Paste your test cases as JSON or list one per line in format: ID: Title: Requirement: Status'}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={12}
                  maxRows={20}
                  placeholder={isPortuguese 
                    ? `Formato JSON:
[
  {
    "id": "TC-001",
    "title": "Login com credenciais válidas",
    "requirement": "REQ-001",
    "status": "passed"
  }
]

Ou formato simples (um por linha):
TC-001: Login válido: REQ-001: passed
TC-002: Login inválido: REQ-001: failed`
                    : `JSON format:
[
  {
    "id": "TC-001",
    "title": "Login with valid credentials",
    "requirement": "REQ-001",
    "status": "passed"
  }
]

Or simple format (one per line):
TC-001: Valid login: REQ-001: passed
TC-002: Invalid login: REQ-001: failed`}
                  value={testCasesText}
                  onChange={(e) => setTestCasesText(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? '#0a0f14' : '#ffffff',
                      color: isDarkMode ? '#e5e7eb' : '#1e293b',
                      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      borderRadius: 2,
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                      '&:hover': {
                        borderColor: isDarkMode ? 'rgba(74, 222, 128, 0.5)' : '#4ade80'
                      },
                      '&.Mui-focused': {
                        borderColor: '#4ade80',
                        boxShadow: `0 0 0 3px ${isDarkMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.15)'}`
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    component="label"
                    size="medium"
                    startIcon={<UploadFileIcon />}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                      color: isDarkMode ? '#d1d5db' : '#475569',
                      '&:hover': {
                        borderColor: '#4ade80',
                        backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(74, 222, 128, 0.05)'
                      }
                    }}
                  >
                    {isPortuguese ? 'Importar JSON' : 'Import JSON'}
                    <input
                      type="file"
                      hidden
                      accept=".json,.txt"
                      onChange={(e) => handleFileUpload(e, 'testCases')}
                    />
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? <CircularProgress size={22} color="inherit" /> : <SmartToyIcon />}
              onClick={handleAnalyze}
              disabled={analyzing || (!requirementsText.trim() && !testCasesText.trim())}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                px: 6,
                py: 2,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: isDarkMode ? '#374151' : '#cbd5e1',
                  boxShadow: 'none'
                }
              }}
            >
              {analyzing 
                ? (isPortuguese ? 'Analisando com IA...' : 'Analyzing with AI...') 
                : (isPortuguese ? '🚀 Analisar Cobertura com IA' : '🚀 Analyze Coverage with AI')}
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
          <Chip 
            icon={<SmartToyIcon sx={{ color: 'white !important' }} />}
            label={`${isPortuguese ? 'Modelo' : 'Model'}: ${localSelectedModel?.label || localSelectedModel?.version || selectedModel}`}
            sx={{ mt: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            variant="outlined"
          />
        </Paper>

        {/* Re-analyzing visual feedback */}
        {analyzing && hasAnalyzed && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${isDarkMode ? '#374151' : '#dbeafe'}`,
              backgroundColor: isDarkMode ? '#1a202c' : '#f8fbff',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                {isPortuguese
                  ? 'Reanalisando cobertura com IA... aguarde.'
                  : 'Re-analyzing coverage with AI... please wait.'}
              </Typography>
            </Box>
            <LinearProgress />
          </Paper>
        )}

        {/* Input Form - Show when no analysis yet or when user wants to re-analyze */}
        {!hasAnalyzed && !initialRequirements && renderInputForm()}

        {/* Show re-analyze button when data exists */}
        {hasAnalyzed && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => setHasAnalyzed(false)}
              disabled={analyzing}
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
              {analyzing
                ? (isPortuguese ? 'Reanalisando...' : 'Re-analyzing...')
                : (isPortuguese ? 'Reanalisar com IA' : 'Re-analyze with AI')}
            </Button>
          </Box>
        )}

        {/* Stats Cards - Only show after analysis */}
        {hasAnalyzed && (
          <Grid container spacing={3} sx={{ mb: 5 }}>
          {/* Cobertura - considerando testes sugeridos */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: coverageStats.coveragePercentage >= 80 ? '#4ade80' : coverageStats.coveragePercentage >= 50 ? '#fbbf24' : '#ef4444' }}>
                    <TrendingUpIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                      {isPortuguese ? 'Cobertura de Testes' : 'Test Coverage'}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                      {coverageStats.coveragePercentage || 0}%
                    </Typography>
                    {coverageStats.suggestedTestsCount > 0 && (
                      <Typography variant="caption" sx={{ color: '#f97316', display: 'block' }}>
                        +{coverageStats.suggestedTestsCount} {isPortuguese ? 'sugeridos' : 'suggested'}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Testes Passando */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#4ade80' }}>
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                      {isPortuguese ? 'Testes Passando' : 'Passing Tests'}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#4ade80' }}>
                      {coverageStats.passedTests ?? 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#94a3b8' }}>
                      {isPortuguese ? 'de' : 'of'} {coverageStats.totalTests || 0} {isPortuguese ? 'total' : 'total'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Testes Falhando */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: coverageStats.failedTests > 0 ? '#ef4444' : '#64748b' }}>
                    <ErrorIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                      {isPortuguese ? 'Testes Falhando' : 'Failing Tests'}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: coverageStats.failedTests > 0 ? '#ef4444' : (isDarkMode ? '#f3f4f6' : '#1e293b') }}>
                      {coverageStats.failedTests ?? 0}
                    </Typography>
                    {coverageStats.failedTests > 0 && (
                      <Typography variant="caption" sx={{ color: '#ef4444' }}>
                        {isPortuguese ? '⚠️ Investigar' : '⚠️ Investigate'}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Testes Pendentes */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#fbbf24' }}>
                    <WarningIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                      {isPortuguese ? 'Pendentes/Não Executados' : 'Pending/Not Run'}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: coverageStats.pendingTests > 0 ? '#fbbf24' : (isDarkMode ? '#f3f4f6' : '#1e293b') }}>
                      {coverageStats.pendingTests ?? 0}
                    </Typography>
                    {coverageStats.pendingTests > 0 && (
                      <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#94a3b8' }}>
                        {isPortuguese ? 'Aguardando execução' : 'Awaiting execution'}
                      </Typography>
                    )}
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
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
              {isPortuguese ? 'Matriz de Rastreabilidade' : 'Traceability Matrix'}
            </Typography>
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
                              {test.displayId || test.id || `TC-${idx + 1}`}
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
