import { createContext, useContext, useMemo, useState } from 'react';
import useApiRequest from 'src/hooks/useApiRequest';
import { formatToValidTuple, formatToISOString } from 'src/utils';

const AppContext = createContext();

export default function AppProvider({ children }) {
  const today = new Date();
  /**
   * @typedef {object} UserParams
   * @property {[Date, Date]} dateRange
   * @property {number[]} [bbox]
  */
  /** @type {[UserParams, Function]} */
  const [
    userParams,
    setUserParams
  ] = useState({
    dateRange: [
    today,
    new Date(new Date(today).setDate(today.getDate() + 7)),
  ]
  });
  const [hoveredOpportunity, setHoveredOpportunity] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [openFilters, setOpenFilters] = useState(false);

  const params = useMemo(() => {
    return userParams.bbox ? {
      "bbox": formatToValidTuple(userParams.bbox),
      "datetime": formatToISOString(userParams.dateRange)
      //start_date: dateRange[0], call time formatting here
      //end_date: dateRange[1] call time formatting here
    } : null;
  }, [userParams])

  const { isLoading, data: opportunities, error } = useApiRequest(params);

  const app = {
    userParams,
    setUserParams,
    isLoading,
    opportunities,
    error,
    selectedOpportunity,
    setSelectedOpportunity,
    hoveredOpportunity,
    setHoveredOpportunity,
    openFilters,
    setOpenFilters
  }

  return (
    <AppContext.Provider value={app}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext);
}
