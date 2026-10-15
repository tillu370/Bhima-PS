import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UiContext = createContext(null);
export const useUi = () => useContext(UiContext);

// Toast messages, the enquiry modal and the cart drawer open state.
export function UiProvider({ children }) {
  const [toastState, setToastState] = useState({ msg: '', type: '', show: false });
  const [enquiry, setEnquiry] = useState({ open: false, title: 'Get a Custom Quote', product: '' });
  const [cartOpen, setCartOpen] = useState(false);
  const [enquiryVersion, setEnquiryVersion] = useState(0); // bumps after an enquiry is saved so lists can refresh
  const enquirySent = useCallback(() => setEnquiryVersion(v => v + 1), []);
  const timer = useRef();

  const toast = useCallback((msg, type = '') => {
    clearTimeout(timer.current);
    setToastState({ msg, type, show: true });
    timer.current = setTimeout(() => setToastState(s => ({ ...s, show: false })), 4200);
  }, []);

  const openEnquiry = useCallback((title = 'Get a Custom Quote', opts = {}) => {
    setEnquiry({ open: true, title, product: opts.product || '' });
  }, []);
  const closeEnquiry = useCallback(() => setEnquiry(e => ({ ...e, open: false })), []);

  const value = useMemo(() => ({
    toast, toastState, enquiry, openEnquiry, closeEnquiry, cartOpen, setCartOpen, enquiryVersion, enquirySent
  }), [toast, toastState, enquiry, openEnquiry, closeEnquiry, cartOpen, enquiryVersion, enquirySent]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
