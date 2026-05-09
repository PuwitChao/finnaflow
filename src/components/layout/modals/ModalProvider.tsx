import React from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { BatchPasteModal } from '../../finance/modals/BatchPasteModal';
import { CSVMapperModal } from '../../finance/modals/CSVMapperModal';
import { FireTrackerOverlay } from '../../finance/modals/FireTrackerOverlay';
import { OnboardingOverlay } from './OnboardingOverlay';
import { WikiPage } from './WikiPage';

import { UserGuideView } from './UserGuideView';

/**
 * Global Modal Provider
 * Orchestrates the rendering of application-level overlays.
 */
export const ModalProvider: React.FC = () => {
    const { activeModal, closeModal, hasSetPreferences, openModal } = useFinanceStore();

    // Automatically open onboarding if preferences are not set
    React.useEffect(() => {
        if (!hasSetPreferences && activeModal !== 'onboarding') {
            openModal('onboarding');
        }
    }, [hasSetPreferences, activeModal, openModal]);

    if (!activeModal) return null;


    switch (activeModal) {
        case 'batchPaste':
            return <BatchPasteModal onClose={closeModal} />;
        
        case 'wiki':
            // WikiPage currently has its own "Back" logic, 
            // but we can wrap it or modify it to fit the provider pattern.
            return <WikiPage onBack={closeModal} onNavigate={() => {}} />;
        
        case 'guide':
            return <UserGuideView onBack={closeModal} />;
        
        case 'csvMapper':
            return <CSVMapperModal />;

        case 'fireTracker':
            return <FireTrackerOverlay onClose={closeModal} />;
        
        case 'onboarding':
            return <OnboardingOverlay />;

        default:
            return null;

    }
};
