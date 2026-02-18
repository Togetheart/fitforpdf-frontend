import { useState, useEffect } from 'react';

const PRO_PERIOD_LIMIT_DEFAULT = 500;

const QUOTA_STATUS_BY_RENDER_CODE = {
  free_quota_exhausted: 'free',
  credits_exhausted: 'credits',
  pro_quota_exhausted: 'pro',
};

const QUOTA_EXHAUSTION_MESSAGE = {
  free: 'You have reached your free export limit.',
  credits: 'You have used your credits.',
  pro: 'You have reached your monthly Pro export limit.',
};

function toFiniteInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function normalizePlanType(value) {
  const normalized = String(value || 'free').trim().toLowerCase();
  return normalized || 'free';
}

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function getQuotaExhaustedMessage(planType, rawCode) {
  if (rawCode && rawCode === 'free_quota_exhausted') return QUOTA_EXHAUSTION_MESSAGE.free;
  if (rawCode && rawCode === 'credits_exhausted') return QUOTA_EXHAUSTION_MESSAGE.credits;
  if (rawCode && rawCode === 'pro_quota_exhausted') return QUOTA_EXHAUSTION_MESSAGE.pro;
  const normalizedPlan = normalizePlanType(planType);
  return QUOTA_EXHAUSTION_MESSAGE[normalizedPlan] || 'You have reached your exports limit.';
}

function normalizeQuotaState(raw = {}) {
  const planType = normalizePlanType(raw.plan_type || raw.planType || raw.plan || 'free');
  const freePayload = raw && typeof raw.free === 'object' && !Array.isArray(raw.free) ? raw.free : null;
  const freeScalar = raw && (typeof raw.free === 'number' || typeof raw.free === 'string')
    ? raw.free
    : null;
  const freeExportsLeft = (() => {
    const value = pickFirstDefined(
      freePayload?.remaining,
      raw.free_exports_left,
      raw.freeExportsLeft,
      raw.free_left,
      freeScalar,
      raw.remaining,
    );
    const parsed = toFiniteInt(value);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
    return null;
  })();
  const freeExportsLimit = toFiniteInt(
    pickFirstDefined(freePayload?.limit, raw.free_limit, raw.freeLimit),
  );
  const remainingInPeriod = toFiniteInt(
    pickFirstDefined(
      raw.remaining_in_period, raw.remainingInPeriod, raw.remaining,
      raw.remainingThisPeriod, raw.monthly_remaining,
    ),
  );
  const usedInPeriod = toFiniteInt(
    pickFirstDefined(
      raw.used_in_period, raw.usedInPeriod, raw.used,
      raw.usedThisPeriod, raw.monthly_used,
    ),
  );
  const periodLimit = toFiniteInt(
    pickFirstDefined(
      raw.period_limit, raw.periodLimit, raw.monthly_limit, raw.monthlyLimit,
    ),
  );
  return {
    planType,
    freeExportsLeft: Number.isFinite(freeExportsLeft) ? freeExportsLeft : null,
    freeExportsLimit: Number.isFinite(freeExportsLimit) ? freeExportsLimit : null,
    remainingInPeriod: Number.isFinite(remainingInPeriod)
      ? remainingInPeriod
      : (planType === 'pro' ? PRO_PERIOD_LIMIT_DEFAULT : null),
    usedInPeriod: Number.isFinite(usedInPeriod) ? usedInPeriod : null,
    periodLimit: Number.isFinite(periodLimit) ? periodLimit : (planType === 'pro' ? PRO_PERIOD_LIMIT_DEFAULT : null),
  };
}

function getPlanExhausted(planType, remaining, remainingInPeriod) {
  if (normalizePlanType(planType) === 'pro') {
    return Number.isFinite(remainingInPeriod) ? remainingInPeriod <= 0 : false;
  }
  return Number.isFinite(remaining) ? remaining <= 0 : false;
}

function overrideLimitForPlan(currentPlanType, payload = {}) {
  if (currentPlanType === 'pro') {
    return toFiniteInt(payload?.period_limit)
      ?? toFiniteInt(payload?.periodLimit)
      ?? toFiniteInt(payload?.monthly_limit)
      ?? toFiniteInt(payload?.monthlyLimit)
      ?? PRO_PERIOD_LIMIT_DEFAULT;
  }
  return null;
}

export default function useQuota() {
  const [planType, setPlanType] = useState('free');
  const [freeExportsLeft, setFreeExportsLeft] = useState(null);
  const [freeExportsLimit, setFreeExportsLimit] = useState(null);
  const [remainingInPeriod, setRemainingInPeriod] = useState(null);
  const [usedInPeriod, setUsedInPeriod] = useState(null);
  const [periodLimit, setPeriodLimit] = useState(PRO_PERIOD_LIMIT_DEFAULT);
  const [showBuyCreditsPanel, setShowBuyCreditsPanel] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const isQuotaLocked = getPlanExhausted(planType, freeExportsLeft, remainingInPeriod);

  async function syncQuotaState() {
    try {
      const response = await fetch('/api/quota', { method: 'GET' });
      if (!response.ok) return;
      const raw = await response.json().catch(() => null);
      if (!raw || typeof raw !== 'object') return;
      const normalized = normalizeQuotaState(raw);
      setPlanType(normalized.planType);
      setFreeExportsLeft(normalized.freeExportsLeft);
      setFreeExportsLimit(normalized.freeExportsLimit);
      setRemainingInPeriod(normalized.remainingInPeriod);
      setUsedInPeriod(normalized.usedInPeriod);
      setPeriodLimit(normalized.periodLimit);
      setPaywallReason('');
      setPurchaseMessage('');
      setShowBuyCreditsPanel(false);
    } catch {
      // keep current quota state when sync fails
    }
  }

  function applyQuotaExhaustion(code, payload = {}) {
    const normalizedCode = String(code || '').trim();
    const nextPlan = QUOTA_STATUS_BY_RENDER_CODE[normalizedCode] || 'free';
    const nextMessage = getQuotaExhaustedMessage(nextPlan, normalizedCode);
    setPlanType(nextPlan);
    setPaywallReason(nextMessage);
    if (nextPlan === 'pro') {
      const overrideUsed = toFiniteInt(payload?.used_in_period)
        ?? toFiniteInt(payload?.usedInPeriod)
        ?? toFiniteInt(payload?.used)
        ?? 0;
      const overrideLimit = overrideLimitForPlan('pro', payload);
      setRemainingInPeriod(0);
      setUsedInPeriod(overrideUsed);
      setPeriodLimit(overrideLimit);
      setFreeExportsLeft(0);
    } else {
      const overrideFreeLeft = toFiniteInt(payload?.free_exports_left)
        ?? toFiniteInt(payload?.freeExportsLeft)
        ?? toFiniteInt(payload?.free_left)
        ?? toFiniteInt(payload?.free?.remaining)
        ?? 0;
      setFreeExportsLeft(Math.max(0, overrideFreeLeft));
      const overrideFreeLimit = toFiniteInt(payload?.free?.limit)
        ?? toFiniteInt(payload?.free_limit)
        ?? toFiniteInt(payload?.freeLimit);
      setFreeExportsLimit(Number.isFinite(overrideFreeLimit) ? overrideFreeLimit : freeExportsLimit);
      setRemainingInPeriod(null);
      setUsedInPeriod(0);
      setPeriodLimit(overrideLimitForPlan(nextPlan, payload));
    }
    return nextMessage;
  }

  useEffect(() => {
    void syncQuotaState();
  }, []);

  function openBuyCreditsPanel() {
    setPurchaseMessage('');
    setShowBuyCreditsPanel(true);
  }

  function closeBuyCreditsPanel() {
    setShowBuyCreditsPanel(false);
    setPurchaseMessage('');
  }

  return {
    planType,
    freeExportsLeft,
    freeExportsLimit,
    remainingInPeriod,
    usedInPeriod,
    periodLimit,
    isQuotaLocked,
    paywallReason,
    setPaywallReason,
    purchaseMessage,
    setPurchaseMessage,
    showBuyCreditsPanel,
    openBuyCreditsPanel,
    closeBuyCreditsPanel,
    syncQuotaState,
    applyQuotaExhaustion,
  };
}

export { QUOTA_STATUS_BY_RENDER_CODE, PRO_PERIOD_LIMIT_DEFAULT };
