import { useState, useEffect, useCallback } from 'react';

// News categories for quick filters
const NEWS_CATEGORIES = [
  { id: 'general', label: 'Top' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Tech' },
  { id: 'science', label: 'Science' },
];

// Relative time formatter
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

function NewsWidget({ dark, t, collapsed: initialCollapsed = true }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('general');
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchNews = useCallback(async (cat = category, query = '') => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/news?pageSize=8';
      if (query) {
        url += `&type=search&q=${encodeURIComponent(query)}`;
      } else {
        url += `&category=${cat}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setArticles(data.articles || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch news');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Initial fetch
  useEffect(() => {
    if (!collapsed) {
      fetchNews(category);
    }
  }, [collapsed, category, fetchNews]);

  // Handle category change
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setIsSearching(false);
    setSearchQuery('');
    fetchNews(cat);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      fetchNews(category, searchQuery.trim());
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchNews(category);
  };

  return (
    <div style={{
      background: t.glass,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      borderRadius: 20,
      border: `0.5px solid ${t.border}`,
      boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : `0.5px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.orange }}>NEWS FEED</span>
          {loading && (
            <div style={{
              width: 12,
              height: 12,
              border: `2px solid ${t.border}`,
              borderTop: `2px solid ${t.orange}`,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); fetchNews(category, isSearching ? searchQuery : ''); }}
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textSecondary,
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          )}
          <span style={{ color: t.textTertiary, fontSize: 16 }}>
            {collapsed ? '+' : '-'}
          </span>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `0.5px solid ${t.border}`,
                borderRadius: 8,
                fontSize: 12,
                background: t.surface,
                color: t.text,
                outline: 'none',
              }}
            />
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: 'transparent',
                  color: t.textSecondary,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </form>

          {/* Category Pills */}
          {!isSearching && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
              {NEWS_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 16,
                    border: category === cat.id ? `1.5px solid ${t.orange}` : `1px solid ${t.border}`,
                    background: category === cat.id ? `${t.orange}15` : 'transparent',
                    color: category === cat.id ? t.orange : t.textTertiary,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              padding: 16,
              textAlign: 'center',
              color: t.red,
              fontSize: 12,
            }}>
              {error}
            </div>
          )}

          {/* Articles List */}
          {!error && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 320,
              overflowY: 'auto',
            }}>
              {articles.length === 0 && !loading && (
                <div style={{
                  padding: 24,
                  textAlign: 'center',
                  color: t.textTertiary,
                  fontSize: 12,
                }}>
                  No articles found
                </div>
              )}
              {articles.map((article, index) => (
                <a
                  key={`${article.url}-${index}`}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 10,
                    background: t.surface,
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.1s, background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = t.surface;
                  }}
                >
                  {/* Thumbnail */}
                  {article.urlToImage && (
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: t.border,
                    }}>
                      <img
                        src={article.urlToImage}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      marginBottom: 4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {article.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 10,
                      color: t.textTertiary,
                    }}>
                      <span style={{ color: t.orange }}>{article.source}</span>
                      <span>{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsWidget;
