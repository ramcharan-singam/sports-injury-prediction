import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Film, CheckCircle2, Clock, PlayCircle, Plus, User } from 'lucide-react';

export const AssessmentsListPage = () => {
  const { user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [user]);

  const fetchVideos = async () => {
    try {
      const endpoint = user?.role === 'Athlete' ? '/api/videos/me' : '/api/videos';
      const res = await api.get(endpoint);
      setVideos(res.data);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 accent-text"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 theme-card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold theme-text flex items-center space-x-2 font-display">
            <Film className="w-6 h-6 accent-text" />
            <span>Movement Assessments</span>
          </h1>
          <p className="text-xs theme-muted">
            {user?.role === 'Athlete' 
              ? 'View your uploaded video motion assessments and processing statuses'
              : 'Squad-wide movement video assessments, athlete names, and video IDs'}
          </p>
        </div>

        {user?.role === 'Athlete' && (
          <Link
            to="/upload"
            className="inline-flex items-center space-x-2 accent-btn font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Assessment Upload</span>
          </Link>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="theme-card p-12 text-center rounded-2xl space-y-4">
          <Film className="w-12 h-12 theme-muted mx-auto" />
          <h3 className="text-base font-bold theme-text">No assessments found</h3>
          <p className="text-xs theme-muted">
            Upload a movement assessment video clip to start processing.
          </p>
          {user?.role === 'Athlete' && (
            <Link
              to="/upload"
              className="inline-block accent-btn font-semibold text-xs py-2 px-4 rounded-xl"
            >
              Upload Video
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div key={vid.video_id} className="theme-card p-5 rounded-2xl space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-bold accent-text tracking-wider block">
                      {vid.activity}
                    </span>
                    {/* Athlete Name Displayed */}
                    <h3 className="text-sm font-extrabold theme-text flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 accent-text" />
                      <span>{vid.athlete_name || 'Athlete'}</span>
                    </h3>
                    <div className="text-[11px] theme-muted font-mono space-y-0.5 pt-0.5">
                      <div>Video ID: <strong className="theme-text">{vid.video_id.slice(0, 8)}...</strong></div>
                      <div>Athlete ID: <strong className="theme-text">{vid.athlete_id.slice(0, 8)}...</strong></div>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 flex-shrink-0 ${
                    vid.processing_status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {vid.processing_status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3 animate-pulse" />
                    )}
                    <span>{vid.processing_status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs theme-input p-3 rounded-xl">
                  <div>
                    <span className="theme-muted block text-[10px] uppercase font-semibold">Duration</span>
                    <span className="font-semibold theme-text">{vid.duration || 10.0}s</span>
                  </div>
                  <div>
                    <span className="theme-muted block text-[10px] uppercase font-semibold">Framerate</span>
                    <span className="font-semibold theme-text">{vid.fps || 30} FPS</span>
                  </div>
                  <div>
                    <span className="theme-muted block text-[10px] uppercase font-semibold">Resolution</span>
                    <span className="font-semibold theme-text">{vid.resolution || '1920x1080'}</span>
                  </div>
                  <div>
                    <span className="theme-muted block text-[10px] uppercase font-semibold">Clarity Score</span>
                    <span className="font-semibold text-emerald-400">{vid.quality_score || 94.5}%</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/results/${vid.video_id}`}
                className="w-full py-2.5 px-4 theme-card hover:bg-white/10 theme-text rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 group mt-4 border"
              >
                <PlayCircle className="w-4 h-4 accent-text" />
                <span>View Video & Results</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
