import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WebApp } from '@grammyjs/web-app';

// Assuming you have a Prisma client set up
interface Bookmark {
  id: number;
  link: string;
  userId: number;
  updated_at: Date;
  created_at: Date;
  content: string;
  folderId: number;
  name: string;
  folder: Folder; // Include the folder object in Bookmark interface
}

interface Folder {
  id: number;
  userId: number;
  updated_at: Date;
  created_at: Date;
  name: string;
}

function Home() {
  const [bookmarksWithFolders, setBookmarksWithFolders] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    WebApp.ready();

    if (WebApp.initDataUnsafe.user) {
      const id = WebApp.initDataUnsafe.user.id;
      console.log(id);

      fetchUserData(id);
    }
    fetchUserData(352550606);

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

  async function fetchUserData(userId: number) {
    setLoading(true);
    try {
      const [bookmarksResponse, foldersResponse] = await Promise.all([
        fetch(`https://backend-mini-app-buildpsace-2d3f53b0a656.herokuapp.com/api/bookmarks/user/${userId}`),
        fetch(`https://backend-mini-app-buildpsace-2d3f53b0a656.herokuapp.com/api/folders/${userId}`), // Adjust endpoint as per your API structure
      ]);

      if (!bookmarksResponse.ok || !foldersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const bookmarksData: Bookmark[] = await bookmarksResponse.json();
      const foldersData: Folder[] = await foldersResponse.json();

      // Map folders data to an object for easy lookup
      const foldersMap: { [key: number]: Folder } = {};
      foldersData.forEach(folder => {
        foldersMap[folder.id] = folder;
      });

      // Assign folders to bookmarks
      const bookmarksWithFolders: Bookmark[] = bookmarksData.map(bookmark => ({
        ...bookmark,
        folder: foldersMap[bookmark.folderId], // Assign folder object using folderId
      }));

      setBookmarksWithFolders(bookmarksWithFolders);
      setFolders(foldersData);
      console.log('FETCHED!');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  const groupedBookmarks = bookmarksWithFolders.reduce<{ [folderName: string]: Bookmark[] }>((acc, bookmark) => {
    const { name } = bookmark.folder;
    if (name) {
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(bookmark);
    }
    return acc;
  }, {});

  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div className="py-2">
      <h3>Your Active Bookmarks</h3>
      <div className="list--centre-justify">
        <input
          type="text"
          placeholder="Looking for..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs"
        />
        {loading ? (
          <p>Loading bookmarks...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          Object.keys(groupedBookmarks).map(folderName => {
            const filteredBookmarks = groupedBookmarks[folderName].filter(bookmark =>
              bookmark.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredBookmarks.length === 0) {
              return null; // Skip rendering this folder if no bookmarks match the search term
            }

            const folder = folders.find(f => f.name === folderName);

            return (
              <div key={folderName} className="max-w-full mx-auto border border-gray-200">
                <div className="flex justify-between items-center ml-1">
                  <h2>{folderName}</h2>
                  {folder && (
                    <Link
                    to={`/edit-folder/${folder.id}?folderName=${encodeURIComponent(folderName)}`}
                    className="btn btn-sm btn-outline"
                    >
                      Edit folder
                    </Link>
                  )}
                </div>
                <div className="flex justify-between items-center ml-1">
                  <ul>
                    {filteredBookmarks.map(bookmark => (
                      <li key={bookmark.id}>
                        <a href={bookmark.link} className="menu-link">
                          {truncateName(bookmark.name, 30)}
                        </a>
                        <p>
                          {truncateName(bookmark.content, 30)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Home;
