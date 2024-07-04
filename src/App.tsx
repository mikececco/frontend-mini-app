import { WebApp } from '@grammyjs/web-app';
import { useState, useEffect } from 'react';

// Assuming you have a Prisma client set up
interface Bookmark {
  id: number;
  link: string;
  userId: number;
  updated_at: Date;
  created_at: Date;
  content: string;
  folder: string;
  name: string;
}

function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    WebApp.ready();

    if (WebApp.initDataUnsafe.user) {
      const id = WebApp.initDataUnsafe.user.id;
      console.log(id);
    }
    fetchUserBookmarksFirst10(352550606);

    WebApp.onEvent('viewportChanged', setViewportData);
    WebApp.setHeaderColor('secondary_bg_color');

    return () => {
      WebApp.offEvent('viewportChanged', setViewportData);
    };
  }, []);

  const setViewportData = () => {
    const WebApp = Telegram.WebApp;
    console.log(`Viewport: ${innerWidth} x ${WebApp.viewportHeight.toFixed(2)}`);
    console.log(`Stable Viewport: ${innerWidth} x ${WebApp.viewportStableHeight.toFixed(2)}`);
    console.log(`Is Expanded: ${WebApp.isExpanded}`);
  };

  async function fetchUserBookmarksFirst10(userId: number) {
    setLoading(true);
    try {
      const response = await fetch(`https://backend-mini-app-buildpsace-2d3f53b0a656.herokuapp.com/api/bookmarks/${userId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Bookmark[] = await response.json();
      setBookmarks(data);
      console.log('FETCHED!');
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }

  // Group bookmarks by folder
  const groupedBookmarks = bookmarks.reduce<{ [folder: string]: Bookmark[] }>((acc, bookmark) => {
    const { folder, name } = bookmark;
    if (name) {
      if (!acc[folder]) {
        acc[folder] = [];
      }
      acc[folder].push(bookmark);
    }
    return acc;
  }, {});

  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div style={{ backgroundColor: Telegram.WebApp.backgroundColor }}>
      <h1>Your Active Bookmarks</h1>
      <div className="list--centre-justify">
        <input
          type="text"
          placeholder="Looking for..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading ? (
          <p>Loading bookmarks...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          Object.keys(groupedBookmarks).map(folder => {
            const filteredBookmarks = groupedBookmarks[folder].filter(bookmark =>
              bookmark.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredBookmarks.length === 0) {
              return null; // Skip rendering this folder if no bookmarks match the search term
            }

            return (
              <div key={folder}>
                <h2>{folder}</h2>
                <ul>
                  {filteredBookmarks.map(bookmark => (
                    <li key={bookmark.id}>
                      <a href={bookmark.link} className="menu-link is-active">
                        {truncateName(bookmark.name, 40)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
