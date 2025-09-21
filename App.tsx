
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SlideInput } from './components/SlideInput';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { PlusIcon, SparklesIcon, TrashIcon, ClearIcon, UploadIcon, FileIcon } from './components/IconComponents';
import { reviewDeck } from './services/geminiService';

const initialSlides = [
  "Q2 Revenue\n\n- Revenue was $5.2M\n- Up 5% QoQ but missed forecast by 2%\n- EMEA region underperformed",
  "Key Initiatives & Challenges\n\n- Launched Project Phoenix successfully\n- Hired new VP of Sales\n- Customer satisfaction is flat due to support issues"
];

const App: React.FC = () => {
  const [slides, setSlides] = useState<string[]>(initialSlides);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSlideChange = (index: number, content: string) => {
    const newSlides = [...slides];
    newSlides[index] = content;
    setSlides(newSlides);
  };

  const addSlide = () => {
    setSlides([...slides, '']);
  };

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
        setSlides(['']); // Clear manual slides to avoid confusion
        setFeedback('');
        setError(null);
      } else {
        setError('Invalid file type. Please upload a PDF, PPT, or PPTX file.');
        // Clear the file input
        event.target.value = '';
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setSlides(initialSlides); // Restore default slides
  };

  const handleReview = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setFeedback('');

    try {
      const source = uploadedFile ? uploadedFile : slides;
      const result = await reviewDeck(source);
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [slides, isLoading, uploadedFile]);
  
  const handleClear = () => {
    setSlides(['']);
    setUploadedFile(null);
    setFeedback('');
    setError(null);
  };

  const isReviewDisabled = isLoading || (!uploadedFile && slides.every(s => !s.trim()));

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Slide Inputs */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-200">Your Deck</h2>
              {!uploadedFile && (
                <button
                  onClick={addSlide}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white font-semibold transition-colors duration-200 disabled:opacity-50"
                >
                  <PlusIcon />
                  Add Slide
                </button>
              )}
            </div>

            {/* File Upload Area */}
            <div className="relative">
              {!uploadedFile ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-700 rounded-lg hover:border-indigo-500 transition-colors">
                    <UploadIcon className="mx-auto h-10 w-10 text-slate-500" />
                    <label htmlFor="file-upload" className="mt-2 block text-sm font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      <span>Upload a presentation</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.ppt,.pptx" />
                    </label>
                    <p className="mt-1 text-xs text-slate-500">PDF, PPT, PPTX</p>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-700"></div></div>
                        <div className="relative flex justify-center"><span className="bg-slate-900 px-2 text-sm text-slate-400">OR</span></div>
                    </div>
                    <p className="text-sm text-slate-400">Enter content manually below</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 font-medium text-slate-200">
                    <FileIcon className="h-6 w-6 text-indigo-400" />
                    <span>{uploadedFile.name}</span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-slate-500 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <TrashIcon />
                  </button>
                </div>
              )}
            </div>

            {/* Manual Slide Inputs */}
            {!uploadedFile && (
              <div className="space-y-4 pr-2 max-h-[60vh] overflow-y-auto">
                {slides.map((content, index) => (
                  <SlideInput
                    key={index}
                    slideNumber={index + 1}
                    content={content}
                    onChange={(newContent) => handleSlideChange(index, newContent)}
                    onRemove={() => removeSlide(index)}
                    isRemoveDisabled={slides.length <= 1}
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-auto pt-4">
               <button
                onClick={handleReview}
                disabled={isReviewDisabled}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md text-white font-bold text-lg transition-all duration-200 disabled:bg-green-800 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Reviewing...
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    Review Deck
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 font-semibold transition-colors duration-200 disabled:opacity-50"
                title="Clear all slides and feedback"
              >
                <ClearIcon />
              </button>
            </div>
          </div>

          {/* Right Panel: Feedback */}
          <div className="flex flex-col">
             <h2 className="text-2xl font-bold text-slate-200 mb-6">AI Feedback</h2>
             <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-full min-h-[50vh] flex flex-col">
              {isLoading && !feedback && (
                <div className="m-auto text-center text-slate-400">
                  <div className="w-8 h-8 mx-auto border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="font-semibold">Analyzing your deck...</p>
                  <p className="text-sm">This may take a moment, especially for large files.</p>
                </div>
              )}
              {error && (
                <div className="m-auto text-center text-red-400">
                  <h3 className="font-bold text-lg">An Error Occurred</h3>
                  <p className="mt-2 bg-red-900/50 p-3 rounded-md">{error}</p>
                </div>
              )}
              {!isLoading && !error && !feedback && (
                  <div className="m-auto text-center text-slate-500">
                      <SparklesIcon className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="font-bold text-lg text-slate-400">Feedback will appear here</h3>
                      <p className="mt-1">Upload a file or enter slide content to get started.</p>
                  </div>
              )}
              {feedback && <FeedbackDisplay feedback={feedback} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
