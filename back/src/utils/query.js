function escapeRegex(value) {
  return String(value).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPagination(pageValue, limitValue, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, Number.parseInt(pageValue, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(limitValue, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { escapeRegex, getPagination };
