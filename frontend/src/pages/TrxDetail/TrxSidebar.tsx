import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Tag,
    Upload,
    X,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trx } from '@/services/trxService.ts';
import { uploadService } from '@/services/uploadService';
import { useUpload } from '@/hooks/useUpload';

interface TrxSidebarProps {
    trx: Trx | null;
    trxId: string | undefined;
}

export default function TrxSidebar({ trx, trxId }: TrxSidebarProps) {
    const navigate = useNavigate();
    const { uploadImage, removeImage, uploading: isUploadingImage, error: uploadError, clearError } = useUpload();

    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [removingImageId, setRemovingImageId] = useState<string | null>(null);

    // Sync uploaded images with trx.img
    useEffect(() => {
        if (trx?.img) {
            setUploadedImages([trx.img]);
        } else {
            setUploadedImages([]);
        }
    }, [trx?.img]);

    // Handle upload errors
    useEffect(() => {
        if (uploadError) {
            toast.error(uploadError);
            clearError();
        }
    }, [uploadError, clearError]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle className="h-3 w-3 text-orange-500">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="text-sm text-muted-foreground">Project</div>
                            <div className="font-medium">
                                {typeof trx?.project === 'object' && trx?.project !== null && 'name' in (trx?.project || {})
                                    ? (
                                        <button
                                            onClick={() => navigate(`/finance/project/${(trx?.project as any)?._id}`)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            title={`View project: ${(trx?.project as any)?.name}`}
                                        >
                                            {(trx?.project as any)?.name}
                                        </button>
                                    )
                                    : (typeof trx?.project === 'string' ? trx?.project : 'N/A')
                                }
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="text-sm text-muted-foreground">Date Executed</div>
                            <div className="font-medium">
                                {trx?.dateEx ? formatDate(trx?.dateEx) : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {trx?.updatedBy && typeof trx?.updatedBy === 'object' && trx?.updatedBy !== null && (
                        <div>
                            <div className="text-sm text-muted-foreground">Updated By</div>
                            <div className="font-medium">{(trx?.updatedBy as any)?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{(trx?.updatedBy as any)?.email || 'N/A'}</div>
                        </div>
                    )}

                    <div>
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="font-medium">
                            {trx?.updatedAt ? formatDate(trx?.updatedAt) : 'N/A'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Images */}
            <Card>
                <CardHeader>
                    <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Image Preview */}
                    {uploadedImages.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">Uploaded Images ({uploadedImages.length})</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {uploadedImages.map((imageName: string, idx: number) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={uploadService.viewImage(imageName)}
                                            alt={`Preview ${idx}`}
                                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                                            onClick={() => setPreviewImage(uploadService.viewImage(imageName))}
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setRemovingImageId(imageName);
                                                    await removeImage(trxId || '', imageName);
                                                    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                                                    toast.success('Image removed successfully');
                                                } catch (err) {
                                                    toast.error('Failed to remove image');
                                                    console.error(err);
                                                } finally {
                                                    setRemovingImageId(null);
                                                }
                                            }}
                                            disabled={removingImageId === imageName || isUploadingImage}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                                        >
                                            {removingImageId === imageName ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <X className="h-3 w-3" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={async (e) => {
                                const files = e.target.files;
                                if (files && trxId) {
                                    for (let i = 0; i < files.length; i++) {
                                        const file = files[i];
                                        try {
                                            const filename = await uploadImage(file, trxId);
                                            setUploadedImages(prev => [...prev, filename]);
                                            toast.success(`Image uploaded successfully`);
                                        } catch (err) {
                                            toast.error('Failed to upload image');
                                            console.error(err);
                                        }
                                    }
                                    // Reset input
                                    e.target.value = '';
                                }
                            }}
                            className="hidden"
                            id="image-upload"
                            disabled={isUploadingImage}
                        />
                        <label htmlFor="image-upload" className={`cursor-pointer ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploadingImage ? (
                                <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            )}
                            <p className="text-sm font-medium">{isUploadingImage ? 'Uploading...' : 'Drop images here or click to upload'}</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img src={previewImage} alt="Full preview" className="max-w-full max-h-full" />
                    </div>
                </div>
            )}
        </div>
    );
}
