import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthView } from './views/AuthView';
import { AppShell } from './components/layout/AppShell';
import { StorylineGuide, STORY_STEPS } from './components/StorylineGuide';
import { CopilotDrawer } from './components/CopilotDrawer';
import { OfflineSyncModal } from './components/OfflineSyncModal';
import { FarmerView } from './views/FarmerView';
import { ExpertView } from './views/ExpertView';
import { OfficerView } from './views/OfficerView';
import { AdminView } from './views/AdminView';
import { CaseChatModal } from './components/common/CaseChatModal';
import { api } from './services/api';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';

export function App() {
  const { isAuthenticated, authInitialized, role, switchRole, setSelectedFieldId } = useAuth();
  
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isStorylineOpen, setIsStorylineOpen] = useState(false);
  const [isCaseChatOpen, setIsCaseChatOpen] = useState(false);
  const [activeChatCaseId, setActiveChatCaseId] = useState('obs_seed_104_1');
  const [activeChatFieldId, setActiveChatFieldId] = useState('104');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeStoryStep, setActiveStoryStep] = useState(1);
  const [isStoryActionRunning, setIsStoryActionRunning] = useState(false);

  // Automated 8-step decision loop runner
  const handleTriggerStepAction = async (stepNum) => {
    setIsStoryActionRunning(true);
    try {
      if (stepNum === 1) {
        // Observe: Farmer submits ambiguous scan for Field 104
        await switchRole('Farmer');
        setSelectedFieldId('104');
        await api.submitObservation({
          field_id: '104',
          symptom_keywords: ['leaf_spots_concentric'],
          image_ref: 'leaf_scan_ambiguous_early_blight.jpg',
          notes: 'Lower leaf concentric spotting'
        });
        setActiveStoryStep(2);
      } else if (stepNum === 2) {
        // Investigate: Narrow diagnosis with leaf underside evidence
        await switchRole('Farmer');
        const pending = await api.getPendingCases().catch(() => []);
        const targetObs = pending[0]?.observation_id || 'obs_seed_104_1';
        await api.submitInvestigation(targetObs, {
          farmer_answer: 'Leaf underside shows dark concentric sporulation without pycnidia specks.',
          underside_image_ref: 'leaf_underside_close_up.jpg'
        });
        setActiveStoryStep(3);
        await switchRole('Expert');
      } else if (stepNum === 3) {
        // Verify: Expert verifies ground truth & severity
        await switchRole('Expert');
        const pending = await api.getPendingCases().catch(() => []);
        const targetObs = pending[0]?.observation_id || 'obs_seed_104_1';
        await api.submitExpertReview({
          observation_id: targetObs,
          confirmed_disease: 'Early Blight',
          severity: 'High',
          comments: 'Morphology verified against ICAR blight benchmark.',
          advisory_notes: 'Prune lower foliage, apply Trichoderma foliar spray.',
          expert_name: 'Dr. Meera Nair'
        });
        setActiveStoryStep(4);
      } else if (stepNum === 4) {
        // Assess: Field Health Passport & Risk Recalculation
        await switchRole('Farmer');
        setSelectedFieldId('104');
        await api.recomputeRisk('104');
        setActiveStoryStep(5);
      } else if (stepNum === 5) {
        // Prioritize: Officer Queue shows Field 104 ranked #1
        await switchRole('Officer');
        await api.getPriorityQueue();
        setActiveStoryStep(6);
      } else if (stepNum === 6) {
        // Act: Officer logs intervention & schedules follow-up
        await switchRole('Officer');
        await api.recordIntervention({
          field_id: '104',
          action_taken: 'Extension visit conducted: Bio-fungicide & foliage sanitation advisory issued.',
          officer_name: 'Officer Deshmukh'
        });
        setActiveStoryStep(7);
        await switchRole('Farmer');
      } else if (stepNum === 7) {
        // Monitor: Farmer submits follow-up scan showing improved severity
        await switchRole('Farmer');
        setSelectedFieldId('104');
        await api.recordOutcome({
          field_id: '104',
          followup_id: 'fol_104_demo',
          new_severity_pct: 35
        });
        setActiveStoryStep(8);
        await switchRole('Admin');
      } else if (stepNum === 8) {
        // Learn: Admin views AI-Expert learning pair & audit log
        await switchRole('Admin');
        await api.getAdminStats();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setActiveStoryStep(1);
      }
    } catch (e) {
      console.warn('Step execution note:', e);
      setActiveStoryStep(prev => (prev < 8 ? prev + 1 : 1));
    } finally {
      setIsStoryActionRunning(false);
    }
  };

  // Loading state while verifying JWT
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Initializing CultivAI Security Environment…
        </p>
      </div>
    );
  }

  // Unauthenticated: Show Login / Signup Screen
  if (!isAuthenticated) {
    return <AuthView />;
  }

  const roleMeta = {
    Farmer: {
      title: 'Farmer Operational Hub',
      subtitle: 'Field Health Passport, Ambiguity Lab & Evidence Narrowing'
    },
    Expert: {
      title: 'ICAR Agronomist Triage',
      subtitle: 'Uncertainty Queue, Differential Diagnosis & Ground Truth'
    },
    Officer: {
      title: 'District Extension Command',
      subtitle: 'Spatial Outbreak Clusters & Ranked Inspection Queue'
    },
    Admin: {
      title: 'System Operations & Metrics',
      subtitle: 'AI-Expert Calibration Matrix, Model Drift & Audit Logs'
    }
  };

  const currentMeta = roleMeta[role] || roleMeta.Farmer;

  return (
    <>
      <AppShell
        activeViewTitle={currentMeta.title}
        activeViewSubtitle={currentMeta.subtitle}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenStoryline={() => setIsStorylineOpen(true)}
        onOpenCaseChat={() => setIsCaseChatOpen(true)}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeStoryStep={activeStoryStep}
      >
        {role === 'Farmer' && (
          <FarmerView 
            activeStoryStep={activeStoryStep}
            currentLanguage={currentLanguage}
            onOpenCaseChat={(cId, fId) => {
              if (cId) setActiveChatCaseId(cId);
              if (fId) setActiveChatFieldId(fId);
              setIsCaseChatOpen(true);
            }}
            onStoryActionComplete={(completedStep) => {
              if (completedStep === 1) setActiveStoryStep(2);
              if (completedStep === 2) setActiveStoryStep(3);
              if (completedStep === 7) setActiveStoryStep(8);
            }}
          />
        )}

        {role === 'Expert' && (
          <ExpertView 
            activeStoryStep={activeStoryStep}
            onOpenCaseChat={(cId, fId) => {
              if (cId) setActiveChatCaseId(cId);
              if (fId) setActiveChatFieldId(fId);
              setIsCaseChatOpen(true);
            }}
            onStoryActionComplete={() => setActiveStoryStep(4)}
          />
        )}

        {role === 'Officer' && (
          <OfficerView 
            activeStoryStep={activeStoryStep}
            onStoryActionComplete={() => setActiveStoryStep(7)}
          />
        )}

        {role === 'Admin' && (
          <AdminView 
            activeStoryStep={activeStoryStep}
          />
        )}
      </AppShell>

      {/* Direct Human-to-Human Case Consultation Chat Modal (Item 10d) */}
      <CaseChatModal
        isOpen={isCaseChatOpen}
        onClose={() => setIsCaseChatOpen(false)}
        caseId={activeChatCaseId}
        fieldId={activeChatFieldId}
      />

      {/* Floating Side Drawer AI Copilot (gpt-oss:120b-cloud) */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* 8-Stage Closed Loop Guided Storyline Tour */}
      <StorylineGuide
        isOpen={isStorylineOpen}
        onClose={() => setIsStorylineOpen(false)}
        activeStep={activeStoryStep}
        onStepSelect={(s) => setActiveStoryStep(s)}
        onTriggerAction={handleTriggerStepAction}
        isRunning={isStoryActionRunning}
      />

      {/* Offline Sync Manager Modal */}
      <OfflineSyncModal />
    </>
  );
}
