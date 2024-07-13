import { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { WebApp } from '@grammyjs/web-app';

interface Bookmark {
  id: number;
  link: string;
  userId: number;
  updated_at: Date;
  created_at: Date;
  content: string;
  folderId: number;
  name: string;
  url: string;
}

interface Folder {
  id: number;
  userId: number;
  updated_at: Date;
  created_at: Date;
  name: string;
}

function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  useEffect(() => {
    WebApp.ready();

    const userId = WebApp.initDataUnsafe.user?.id || 352550606; // Default user ID for testing
    fetchUserData(userId);

    WebApp.setHeaderColor('secondary_bg_color');
  }, []);

  async function fetchUserData(userId: number) {
    setLoading(true);
    try {
      const bookmarksResponse = await fetch(`https://backend-mini-app-buildpsace-2d3f53b0a656.herokuapp.com/api/bookmarks/user/${userId}`);
      const foldersResponse = await fetch(`https://backend-mini-app-buildpsace-2d3f53b0a656.herokuapp.com/api/folders/${userId}`);

      if (!bookmarksResponse.ok || !foldersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const bookmarksData: Bookmark[] = await bookmarksResponse.json();
      const foldersData: Folder[] = await foldersResponse.json();

      const foldersMap: { [key: number]: Folder } = {};
      foldersData.forEach(folder => {
        foldersMap[folder.id] = folder;
      });

      const bookmarksWithFolders: Bookmark[] = bookmarksData.map(bookmark => ({
        ...bookmark,
        folder: foldersMap[bookmark.folderId],
      }));

      setBookmarks(bookmarksWithFolders);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  const swiped = (direction: string, bookmarkName: string) => {
    console.log('You swiped ' + direction + ' on ' + bookmarkName);
    setLastDirection(direction);
  }

  const outOfFrame = (bookmarkName: string) => {
    console.log(bookmarkName + ' left the screen');
  }

    const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div className='app'>
      <link href="https://fonts.googleapis.com/css?family=Damion&display=swap" rel="stylesheet" />
      {loading ? (
        <p>Loading bookmarks...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className='cardContainerr'>
          {bookmarks.map((bookmark) => (
            <TinderCard
              className="swipe"
              key={bookmark.id}
              onSwipe={(dir) => swiped(dir, bookmark.name)}
              onCardLeftScreen={() => outOfFrame(bookmark.name)}
            >
              <div className="cardd">
                <h3>{bookmark.folderId}</h3>
                <a href={bookmark.link} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Visit</a>
                <p className="text-lg font-bold">{truncateName(bookmark.name, 10)}</p>
              </div>
            </TinderCard>
          ))}
        </div>
      )}
      {lastDirection && <h2 className="infoText mt-4 text-xl">You swiped {lastDirection}</h2>}
    </div>
  );
}

export default Home;
