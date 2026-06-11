import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, render } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/*
 * Bug (2026-06-11): configuring a logo on the SAMPLE and clicking "Update
 * preview" did nothing — submitRender stripped logo/accent/footer for the demo
 * file via `!isDemoRender`. But branding is gated SERVER-SIDE by plan
 * (X-Branding-Allowed), and that gate survives the demo quota refund, so a
 * paid/admin user IS entitled to brand the sample. The frontend strip wrongly
 * blocked them (and was redundant for free users — the backend drops it anyway).
 * After the fix, branding is sent for the demo too; the backend keeps gating it.
 */

const DEMO_NAME = 'enterprise-invoices-demo.csv';

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_brand',
    },
  });
}

let renderBody = null;
function installFetch() {
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options = {}) => {
    const u = String(url);
    if (u.includes('/render')) { renderBody = options && options.body; return pdfResponse(); }
    if (u.includes('/api/quota')) {
      return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 3 }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    }
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

function Harness({ onSnapshot }) {
  const conversion = useConversion({
    quota: {
      planType: 'free',
      freeExportsLeft: 3,
      remainingInPeriod: 0,
      syncQuotaState: async () => ({ planType: 'free', freeExportsLeft: 2 }),
      isQuotaLocked: false,
      applyQuotaExhaustion: () => '',
      setPaywallReason: () => {},
      setPurchaseMessage: () => {},
    },
  });
  React.useEffect(() => { onSnapshot(conversion); }, [conversion, onSnapshot]);
  return null;
}

beforeEach(() => {
  renderBody = null;
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  if (!URL.createObjectURL) URL.createObjectURL = vi.fn(() => 'blob:stub');
  if (!URL.revokeObjectURL) URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('useConversion, branding on the sample render', () => {
  test('a configured logo is still sent when rendering the demo file', async () => {
    const restore = installFetch();
    let conv = null;
    render(<Harness onSnapshot={(c) => { conv = c; }} />);

    await act(async () => {
      conv.handleFileSelect(new File(['col,data\n1,2'], DEMO_NAME, { type: 'text/csv' }));
      // raw setter — bypasses the <canvas> logo re-encode jsdom can't run
      conv.setLogoFile(new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'logo.png', { type: 'image/png' }));
    });
    await act(async () => { await conv.handleSubmit({ preventDefault: () => {} }); });

    expect(renderBody).toBeInstanceOf(FormData);
    expect(renderBody.get('logo')).toBeTruthy();

    restore();
  });
});
