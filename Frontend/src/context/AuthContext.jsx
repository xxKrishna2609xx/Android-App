import { createContext, useContext, useState, useEffect } from 'react';
import {
  registerUser,
  loginUserApi
} from '../services/api';

import {
  addBookmark,
  removeBookmark,
  getBookmarks
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted session
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Regular user/owner login
  const loginUser = async (email, password) => {

    const data = await loginUserApi(email, password);

    localStorage.setItem(
      'access_token',
      data.access_token
    );

    localStorage.setItem(
      'refresh_token',
      data.refresh_token
    );

    const bookmarks = await getBookmarks(data.user.id);
    const bookmarkIds =bookmarks.map(b => b.businessId);

    data.user.bookmarks =bookmarkIds;
    setUser(data.user);

    localStorage.setItem(
      'auth_user',
      JSON.stringify(data.user)
    );

    return data.user;
  };



  // Regular user registration
  const signupUser = async (
    name,
    email,
    phone,
    password
  ) => {

    await registerUser({
      name,
      email,
      phone,
      password
    });

    const loginData = await loginUserApi(email, password);

    localStorage.setItem(
      'access_token',
      loginData.access_token
    );

    localStorage.setItem(
      'refresh_token',
      loginData.refresh_token
    );

    const bookmarks = await getBookmarks(loginData.user.id);

    loginData.user.bookmarks = bookmarks.map(b => b.businessId);

    setUser(loginData.user);

    localStorage.setItem(
      'auth_user',
      JSON.stringify(loginData.user)
    );

    return loginData.user;
  };

  // Toggle bookmark listing
  const toggleBookmark = async (
    businessId
  ) => {

    if (!user) return false;

    const bookmarked =user.bookmarks?.includes(businessId);

    try {

      if (bookmarked) {

        await removeBookmark(
          user.id,
          businessId
        );

      } else {

        await addBookmark(
          user.id,
          businessId
        );

      }

      const updatedBookmarks = bookmarked ? user.bookmarks.filter(id => id !== businessId): [...(user.bookmarks || []),businessId];

      const updatedUser = {
        ...user,
        bookmarks:
          updatedBookmarks
      };

      setUser(updatedUser);

      localStorage.setItem(
        "auth_user",
        JSON.stringify(updatedUser)
      );

      return true;

    } catch (err) {

      console.error(err);

      return false;
    }
  };

  const setLoggedInUser = (
      userData
    ) => {

      setUser(userData);

      localStorage.setItem(
        'auth_user',
        JSON.stringify(userData)
      );
    };

  const logout = () => {

    setUser(null);

    localStorage.removeItem(
      'auth_user'
    );

    localStorage.removeItem(
      'access_token'
    );

    localStorage.removeItem(
      'refresh_token'
    );
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      loading,
      setLoggedInUser,
      loginUser,
      signupUser,
      toggleBookmark,
      logout,
      isAdmin: user?.role === 'admin',
      isLoggedIn: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
