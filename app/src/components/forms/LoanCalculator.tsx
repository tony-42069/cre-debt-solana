'use client';

import { FC, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Calendar,
  Percent,
  PieChart,
  BarChart3,
} from 'lucide-react';

interface LoanCalculatorProps {
  propertyValue: number;
  requestedAmount: number;
  termMonths: number;
  interestRate: number;
  onAmountChange: (amount: number) => void;
  onTermChange: (termMonths: number) => void;
}

interface PaymentSchedule {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const LoanCalculator: FC<LoanCalculatorProps> = ({
  propertyValue,
  requestedAmount,
  termMonths,
  interestRate,
  onAmountChange,
  onTermChange,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMonthlyPayment = (
    principal: number,
    annualRate: number,
    months: number
  ): number => {
    if (principal <= 0 || months <= 0) return 0;
    const monthlyRate = annualRate / 12;
    return (
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  };

  const maxLoanAmount = Math.floor(propertyValue * 0.9);
  const ltvRatio = propertyValue > 0 ? (requestedAmount / propertyValue) * 100 : 0;
  const monthlyPayment = calculateMonthlyPayment(
    requestedAmount,
    interestRate,
    termMonths
  );
  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = totalPayments - requestedAmount;

  const paymentSchedule: PaymentSchedule[] = useMemo(() => {
    const schedule: PaymentSchedule[] = [];
    let balance = requestedAmount;
    const monthlyRate = interestRate / 12;

    for (let month = 1; month <= termMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });

      if (balance <= 0) break;
    }

    return schedule;
  }, [requestedAmount, termMonths, interestRate, monthlyPayment]);

  const principalPercentage =
    requestedAmount > 0 ? (requestedAmount / totalPayments) * 100 : 0;
  const interestPercentage =
    requestedAmount > 0 ? (totalInterest / totalPayments) * 100 : 0;

  const quickAmounts = [
    { label: '50%', amount: Math.floor(propertyValue * 0.5) },
    { label: '70%', amount: Math.floor(propertyValue * 0.7) },
    { label: '80%', amount: Math.floor(propertyValue * 0.8) },
    { label: '90%', amount: maxLoanAmount },
  ];

  const quickTerms = [
    { label: '5 Years', months: 60 },
    { label: '10 Years', months: 120 },
    { label: '15 Years', months: 180 },
    { label: '30 Years', months: 360 },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Loan Calculator</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Property Value</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(propertyValue)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Max Loan (90% LTV)</span>
              <span className="text-sm font-medium text-green-700">
                {formatCurrency(maxLoanAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={requestedAmount || ''}
                onChange={(e) =>
                  onAmountChange(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter loan amount"
                min="100000"
                max={maxLoanAmount}
                step="1000"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickAmounts.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onAmountChange(option.amount)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {option.label} ({formatCurrency(option.amount)})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term (Months)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={termMonths || ''}
                onChange={(e) =>
                  onTermChange(parseInt(e.target.value) || 360)
                }
                placeholder="360"
                min="12"
                max="360"
                step="12"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickTerms.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onTermChange(option.months)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {requestedAmount > 0 && termMonths > 0 ? (
            <>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Percent className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      LTV Ratio
                    </span>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      ltvRatio <= 90 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {ltvRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ltvRatio <= 90 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(ltvRatio, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      Monthly Payment
                    </span>
                  </div>
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency(monthlyPayment)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <PieChart className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Payment Distribution
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Principal</span>
                      <span className="font-medium">
                        {formatCurrency(requestedAmount)} ({principalPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${principalPercentage}%` }}
                      />
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${interestPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
                      <span className="text-gray-600">Principal</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(requestedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded mr-2" />
                      <span className="text-gray-600">Interest</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(totalInterest)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Amortization Preview (Year 1)
                  </h4>
                </div>
                <div className="space-y-1">
                  {paymentSchedule.slice(0, 12).map((pmt) => (
                    <div
                      key={pmt.month}
                      className="flex items-center text-xs"
                    >
                      <span className="w-8 text-gray-500">
                        M{pmt.month}
                      </span>
                      <div className="flex-1 h-4 flex rounded overflow-hidden">
                        <div
                          className="bg-blue-500"
                          style={{
                            width: `${(pmt.principal / monthlyPayment) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-orange-500"
                          style={{
                            width: `${(pmt.interest / monthlyPayment) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-20 text-right text-gray-600">
                        {formatCurrency(pmt.balance)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-1" />
                    Principal
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded mr-1" />
                    Interest
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Interest rate shown is an estimate.
                  Final rate will be determined after credit assessment.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Enter loan amount and term to see payment calculations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
