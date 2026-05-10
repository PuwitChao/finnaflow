import React, { useRef } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useI18n } from '../i18n';
import { exportToCSV, splitCSVLine } from '../utils/csvProcessor';
import { getCurrencySymbol } from '../utils/currencies';
import { generatePDFReport } from '../utils/reportGenerator';
import pkgJson from '../../package.json';

const APP_VERSION = pkgJson.version;

export const useFinanceIO = () => {
    const store = useFinanceStore();
    const { t, language } = useI18n();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (store.isPrivacyMode) {
            store.showNotification(t('file.privacyModeBlocked'), 'error');
            return;
        }
        const data = { 
            version: APP_VERSION, 
            incomeItems: store.incomeItems, 
            expenseItems: store.expenseItems, 
            assetItems: store.assetItems,
            liabilityItems: store.liabilityItems,
            insuranceItems: store.insuranceItems,
            isUnlocked: store.isUnlocked, 
            darkMode: store.darkMode, 
            language 
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finnaflow-session-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.incomeItems && data.expenseItems) {
                    store.clearSession();
                    store.loadBulkData({
                        income: data.incomeItems,
                        expenses: data.expenseItems,
                        assets: data.assetItems || [],
                        liabilities: data.liabilityItems || [],
                        insurance: data.insuranceItems || []
                    });
                    store.showNotification(t('file.importSuccess'), 'success');
                }
            } catch { 
                store.showNotification(t('file.importError'), 'error'); 
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleCSVExport = () => {
        if (store.isPrivacyMode) {
            store.showNotification(t('file.privacyModeBlocked'), 'error');
            return;
        }
        const csv = exportToCSV(store.incomeItems, store.expenseItems, store.assetItems, store.liabilityItems);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finnaflow-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
                if (lines.length < 2) {
                    store.showNotification(t('file.csvError'), 'error');
                    return;
                }
                const headers = splitCSVLine(lines[0]);
                const rows = lines.slice(1).map(l => splitCSVLine(l));
                
                store.setCSVDataToMap({ headers, rows });
                store.openModal('csvMapper');
            } catch { 
                store.showNotification(t('file.csvError'), 'error'); 
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleGenerateReport = async () => {
        if (store.isPrivacyMode) {
            store.showNotification(t('file.privacyModeBlocked'), 'error');
            return;
        }
        
        store.showNotification('Generating PDF Report...', 'info');
        
        const metadata = {
            name: 'User',
            date: new Date().toLocaleString(),
            currency: store.currency,
            netWorth: `${getCurrencySymbol(store.currency)}${(store.getTotalAssets() - store.getTotalLiabilities()).toLocaleString()}`
        };

        const elementIds = ['sankey-report-area', 'trend-report-area'];
        try {
            await generatePDFReport(elementIds, metadata);
            store.showNotification('Report Generated!', 'success');
        } catch (err) {
            console.error(err);
            store.showNotification('Failed to generate report', 'error');
        }
    };

    return {
        fileInputRef,
        csvInputRef,
        handleSave,
        handleLoad,
        handleCSVExport,
        handleCSVImport,
        handleGenerateReport
    };
};
