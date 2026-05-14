import api from "../lib/api";

export const statsService = {
  getRevenue: async () => {
    const res = await api.get("/stats/revenue");
    return res.data;
  },

  getRevenueChart: async () => {
    const res = await api.get("/stats/revenue-over-time");
    return res.data;
  },
};
