export function publicPortfolio(data) {
  return {
    ...data,
    ...Object.fromEntries(
      ['projects', 'services', 'skills', 'experience', 'certificates'].map(
        (key) => [
          key,
          (data[key] || []).filter((item) => item.hidden !== true),
        ],
      ),
    ),
  };
}
