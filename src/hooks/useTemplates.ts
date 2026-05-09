import { useFinanceStore, FinanceItem } from '../store/useFinanceStore';
import { useI18n } from '../i18n';
import { scaleTemplateAmount } from '../utils/currencies';

export const useTemplates = () => {
    const store = useFinanceStore();
    const { t, language } = useI18n();

    const handleLoadTemplate = (type: 'beginner' | 'standard') => {
        if (store.currency !== 'THB' && !window.confirm(
            `${t('file.templateCurrencyNote')} ${store.currency}. ${language === 'th' ? 'ดำเนินการต่อ?' : 'Continue?'}`
        )) return;

        const scaleAmount = (thbAmount: number): number => scaleTemplateAmount(thbAmount, store.currency);

        let income: FinanceItem[];
        let expenses: FinanceItem[];
        let assets: any[] = [];
        let liabilities: any[] = [];

        if (type === 'beginner') {
            income = [{ id: crypto.randomUUID(), name: t('inputs.income.common.Salary'), amount: scaleAmount(15000), frequency: 'Monthly', category: 'Needs' }];
            expenses = [
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Rent'), amount: scaleAmount(4500), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Groceries'), amount: scaleAmount(3500), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Fun'), amount: scaleAmount(1500), frequency: 'Monthly', category: 'Wants' },
                { id: crypto.randomUUID(), name: t('file.templateItems.emergencyFund'), amount: scaleAmount(1000), frequency: 'Monthly', category: 'Savings' }
            ];
            assets = [{ id: crypto.randomUUID(), name: t('inputs.assets.common.Cash'), amount: scaleAmount(25000), category: 'Cash' }];
        } else {
            income = [
                { id: crypto.randomUUID(), name: t('inputs.income.common.Salary'), amount: scaleAmount(30000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.income.common.Dividends'), amount: scaleAmount(2500), frequency: 'Monthly', category: 'Investments' }
            ];
            expenses = [
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Rent'), amount: scaleAmount(8000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Groceries'), amount: scaleAmount(5000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Transport'), amount: scaleAmount(2000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Shopping'), amount: scaleAmount(3000), frequency: 'Monthly', category: 'Wants' },
                { id: crypto.randomUUID(), name: t('file.templateItems.etfPortfolio'), amount: scaleAmount(4000), frequency: 'Monthly', category: 'Investments' },
                { id: crypto.randomUUID(), name: t('file.templateItems.retirementFund'), amount: scaleAmount(2500), frequency: 'Monthly', category: 'Savings' },
                { id: crypto.randomUUID(), name: t('file.templateItems.creditCardPayoff'), amount: scaleAmount(1500), frequency: 'Monthly', category: 'Debt' }
            ];
            assets = [
                { id: crypto.randomUUID(), name: t('inputs.assets.common.Cash'), amount: scaleAmount(50000), category: 'Cash' },
                { id: crypto.randomUUID(), name: t('inputs.assets.common.Investments'), amount: scaleAmount(120000), category: 'Stocks' }
            ];
            liabilities = [{ id: crypto.randomUUID(), name: t('inputs.liabilities.common.CarLoan'), amount: scaleAmount(250000), category: 'Car Loan' }];
        }
        store.loadExampleTemplate({ income, expenses, assets, liabilities });
        store.showNotification(t('file.templateSuccess'), 'success');
    };

    return { handleLoadTemplate };
};
