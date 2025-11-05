
import React, { useState, useCallback } from 'react';
import { extractTextFromImage } from './services/geminiService';
import { CameraIcon, TextIcon, UploadIcon, ErrorIcon, ProcessingIcon } from './components/IconComponents';
import Loader from './components/Loader';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setExtractedText('');
            setError('');
        }
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile) {
            setError('분석할 이미지를 먼저 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setExtractedText('');
        setError('');

        try {
            const text = await extractTextFromImage(imageFile);
            setExtractedText(text);
        } catch (err) {
            setError('이미지 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    const ImageDropzone: React.FC = () => (
        <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-full min-h-[300px] border-2 border-dashed border-cyan-500/30 rounded-lg cursor-pointer bg-gray-800/20 hover:bg-gray-800/50 transition-colors duration-300"
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-12 h-12 mb-4 text-cyan-400" />
                <p className="mb-2 text-lg text-gray-400"><span className="font-semibold text-cyan-300">클릭하여 업로드</span> 또는 드래그 앤 드롭</p>
                <p className="text-sm text-gray-500">PNG, JPG, WEBP (최대 10MB)</p>
            </div>
            <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
        </label>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Gemini 이미지 텍스트 추출기
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        C# USB 카메라 시뮬레이션: 이미지 속 문자 및 숫자를 AI로 분석합니다.
                    </p>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Panel */}
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-2xl shadow-cyan-500/10">
                        <div className="flex items-center mb-4">
                            <CameraIcon className="w-8 h-8 mr-3 text-cyan-400" />
                            <h2 className="text-2xl font-semibold">이미지 입력</h2>
                        </div>
                        <div className="mt-6">
                            {previewUrl ? (
                                <div className="relative group">
                                    <img src={previewUrl} alt="업로드된 이미지" className="w-full h-auto rounded-lg object-contain max-h-[400px]" />
                                    <label htmlFor="image-upload" className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <UploadIcon className="w-10 h-10 mr-2" />
                                        <span className="text-lg font-bold">이미지 교체</span>
                                    </label>
                                    <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                                </div>
                            ) : (
                                <ImageDropzone />
                            )}
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={handleAnalyzeClick}
                                disabled={!imageFile || isLoading}
                                className="w-full flex items-center justify-center text-lg font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white shadow-lg hover:shadow-cyan-500/40"
                            >
                                {isLoading ? (
                                    <>
                                        <ProcessingIcon className="w-6 h-6 mr-3 animate-spin" />
                                        <span>분석 중...</span>
                                    </>
                                ) : (
                                    <span>분석 시작</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-2xl shadow-blue-500/10">
                        <div className="flex items-center mb-4">
                            <TextIcon className="w-8 h-8 mr-3 text-blue-400" />
                            <h2 className="text-2xl font-semibold">분석 결과</h2>
                        </div>
                        <div className="mt-6 bg-gray-900/70 p-4 rounded-lg min-h-[300px] max-h-[500px] overflow-y-auto prose prose-invert prose-p:my-2 prose-p:text-gray-300">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Loader />
                                    <p className="mt-4 text-gray-400">Gemini가 이미지를 분석하고 있습니다...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-red-400">
                                    <ErrorIcon className="w-12 h-12 mb-4" />
                                    <p className="font-semibold text-lg">오류 발생</p>
                                    <p>{error}</p>
                                </div>
                            ) : extractedText ? (
                                <p className="whitespace-pre-wrap">{extractedText}</p>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <p>분석을 시작하려면 이미지를 업로드하세요.</p>
                                    <p>결과가 여기에 표시됩니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
