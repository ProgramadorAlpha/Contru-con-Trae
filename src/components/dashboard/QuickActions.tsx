import React, { useState, lazy, Suspense, useCallback } from 'react';
import { PlusCircle, FileText, CalendarClock } from 'lucide-react';
import { QuickActionButton } from './QuickActionButton';
import { incomeService } from '@/services/incomeService';
import { expenseService } from '@/services/expenseService';
import { visitService } from '@/services/visitService';
import type { CreateIncomeDTO } from '@/types/income';
import type { CreateExpenseDTO } from '@/types/expenses';
import type { CreateVisitDTO } from '@/types/visit';

// Lazy load modals for better performance
const AddIncomeModal = lazy(() => import('./modals/AddIncomeModal').then(m => ({ default: m.AddIncomeModal })));
const RegisterExpenseModal = lazy(() => import('./modals/RegisterExpenseModal').then(m => ({ default: m.RegisterExpenseModal })));
const ScheduleVisitModal = lazy(() => import('./modals/ScheduleVisitModal').then(m => ({ default: m.ScheduleVisitModal })));

interface QuickActionsProps {
  onActionComplete?: (action: 'income' | 'expense' | 'visit') => void;
  className?: string;
}

type ActiveModal = 'income' | 'expense' | 'visit' | null;

export const QuickActions: React.FC<QuickActionsProps> = ({
  onActionComplete,
  className = '',
}) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), type === 'success' ? 3000 : 5000);
  }, []);

  const handleAddIncome = useCallback(() => {
    setActiveModal('income');
  }, []);

  const handleRegisterExpense = useCallback(() => {
    setActiveModal('expense');
  }, []);

  const handleScheduleVisit = useCallback(() => {
    setActiveModal('visit');
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleIncomeSuccess = async (data: CreateIncomeDTO) => {
    try {
      await incomeService.createIncome(data);
      setActiveModal(null);
      showNotification('success', `Ingreso de $${data.amount.toLocaleString()} registrado exitosamente`);
      onActionComplete?.('income');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el ingreso';
      showNotification('error', errorMessage);
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleExpenseSuccess = async (data: CreateExpenseDTO) => {
    try {
      await expenseService.createExpenseQuick(data);
      setActiveModal(null);
      showNotification('success', `Gasto de $${data.amount.toLocaleString()} registrado exitosamente`);
      onActionComplete?.('expense');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar el gasto';
      showNotification('error', errorMessage);
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleVisitSuccess = async (data: CreateVisitDTO) => {
    try {
      await visitService.createVisit(data);
      setActiveModal(null);
      showNotification('success', `Visita agendada exitosamente para el ${new Date(data.date).toLocaleDateString()}`);
      onActionComplete?.('visit');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al agendar la visita';
      showNotification('error', errorMessage);
      throw error; // Re-throw to let modal handle it
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Acciones Rápidas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionButton
          label="Añadir Ingreso"
          icon={<PlusCircle size={24} />}
          color="blue"
          onClick={handleAddIncome}
          ariaLabel="Añadir ingreso al proyecto"
        />
        
        <QuickActionButton
          label="Registrar Gasto"
          icon={<FileText size={24} />}
          color="red"
          onClick={handleRegisterExpense}
          ariaLabel="Registrar gasto del proyecto"
        />
        
        <QuickActionButton
          label="Agendar Visita"
          icon={<CalendarClock size={24} />}
          color="purple"
          onClick={handleScheduleVisit}
          ariaLabel="Agendar visita al proyecto"
        />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          role="alert"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      {/* Modals with Suspense for lazy loading */}
      <Suspense fallback={null}>
        {activeModal === 'income' && (
          <AddIncomeModal
            isOpen={true}
            onClose={handleCloseModal}
            onSuccess={handleIncomeSuccess}
          />
        )}
        {activeModal === 'expense' && (
          <RegisterExpenseModal
            isOpen={true}
            onClose={handleCloseModal}
            onSuccess={handleExpenseSuccess}
          />
        )}
        {activeModal === 'visit' && (
          <ScheduleVisitModal
            isOpen={true}
            onClose={handleCloseModal}
            onSuccess={handleVisitSuccess}
          />
        )}
      </Suspense>
    </div>
  );
};
