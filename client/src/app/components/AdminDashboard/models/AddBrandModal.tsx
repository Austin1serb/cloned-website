
import React, { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import ImageUpload from './ImageUpload';
import { Brand } from '@/components/types';
import BrandForm from './BrandForm';
import KeywordsInput from '../KeywordsInput';

const initialBrandData = {
    name: '',
    imgSource: [],
    description: '',
    isActive: true,
    rating: 0,
    tags: [],
};



interface ErrorState {
    [key: string]: string;
}
interface Props {
    open: boolean;
    onClose: () => void;
    onAddBrand: (brandData: Brand) => void;
    selectedBrand?: Brand | null;
    onUpdateBrand: (brandData: Brand) => void;
}

const apiKey = "process.env.NEXT_PUBLIC_GPT_API_KEY";

const AddBrandModal: React.FC<Props> = ({ open, onClose, onAddBrand, selectedBrand, onUpdateBrand, }) => {
    const [brandData, setBrandData] = useState<Brand>(selectedBrand || initialBrandData);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<ErrorState>({});
    const [selectedImage, setSelectedImage] = useState<File[]>([]);
    const [selectedImageData, setSelectedImageData] = useState<string[]>([]);
    const [selectedStrength, setSelectedStrength] = useState<string>('low');
    const [isNewImageSelected, setIsNewImageSelected] = useState<boolean>(false);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');


    const openSnackbar = (errorData: ErrorState): void => {
        const firstError = Object.values(errorData)[0];
        setSnackbarMessage(firstError);
        setIsSnackbarOpen(true);
    };



    const clearForm = () => {
        setBrandData(initialBrandData);
        setError({});
        setSelectedImage([]);
        setSelectedImageData([]);
        setSelectedStrength('low');
        setLoading(false)
    };


    useEffect(() => {
        setBrandData((prevData) => ({
            ...prevData,
            imgSource: selectedImageData.map(urlOrObj => {
                if (typeof urlOrObj === 'string') {
                    const existingImageInfo = selectedBrand ? selectedBrand.imgSource.find((img: { url: string; }) => img.url === urlOrObj) : null;
                    return {
                        url: urlOrObj,
                        publicId: existingImageInfo ? existingImageInfo.publicId : undefined
                    };
                }
                return urlOrObj; // if it's already an object, just return as is
            }),
        }));
    }, [selectedImageData, selectedBrand]);




    useEffect(() => {
        if (selectedBrand) {
            setBrandData(selectedBrand);
            // Check if selectedBrand has an image source
            if (selectedBrand.imgSource && selectedBrand.imgSource.length > 0) {
                setSelectedImageData(selectedBrand.imgSource.map(imageObj => imageObj.url));
            } else {
                setSelectedImageData([]);
            }
        } else {
            setBrandData(initialBrandData);
            setSelectedImageData([]);
        }
    }, [selectedBrand]);

    const handleAddKeyword = (newKeyword: string) => {
        setBrandData({
            ...brandData,
            tags: [...brandData.tags, newKeyword],
        });
    };

    const handleRemoveKeyword = (tag: string) => {
        const updatedTags = brandData.tags?.filter((tg) => tg !== tag);
        setBrandData({
            ...brandData,
            tags: updatedTags,
        });
    };


    const handleIsActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBrandData({ ...brandData, isActive: event.target.checked });
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setBrandData({ ...brandData, [name]: value });
        //error state updating
        // Error state updating with validation
        setError((prevError) => {
            const updatedError = { ...prevError };
            // Example validation condition
            if (value.trim() === '') {
                updatedError[name] = 'This field cannot be empty.';
            } else {
                delete updatedError[name];
            }
            return updatedError;
        });

        console.log(brandData)
    }






    const API_URL = 'http://localhost:8000/api/brand/';
    const HEADERS = {
        'Content-Type': 'application/json',
    };


    const handleAddBrand = async () => {
        try {
            setLoading(true);

            const brandToUpdate = prepareBrandData();

            const endpoint = selectedBrand ? `${API_URL}${selectedBrand._id}` : API_URL;
            const method = selectedBrand ? 'PUT' : 'POST';

            const response = await makeApiCall(endpoint, method, brandToUpdate);

            await handleApiResponse(response);
        } catch (error) {
            console.error('Error adding/updating brand:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareBrandData = () => {
        const brandDataCopy = { ...brandData, strength: selectedStrength };

        const imageSource = selectedBrand ? formatImagesForUpdate() : formatImagesForNewBrand();
        brandDataCopy.imgSource = imageSource || [];

        return brandDataCopy;
    };

    const formatImagesForUpdate = () => {
        if (Array.isArray(selectedImageData) && selectedImageData.length) {
            return selectedImageData.map(url => {
                const existingImageInfo = selectedBrand?.imgSource.find(img => img.url === url);
                return {
                    url,
                    publicId: existingImageInfo ? existingImageInfo.publicId : undefined
                };
            });
        }
    };

    const formatImagesForNewBrand = () => {
        if (Array.isArray(selectedImageData) && selectedImageData.length) {
            return selectedImageData.map(url => ({ url }));
        }
    };

    const makeApiCall = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: object): Promise<Response> => {
        return fetch(url, {
            method,
            headers: HEADERS,
            credentials: 'include',
            body: JSON.stringify(data),
        });
    };

    const handleApiResponse = async (response: Response) => {
        if (response.ok) {
            const brand = await response.json();
            if (selectedBrand) {
                onUpdateBrand(brand);
            } else {
                onAddBrand(brand);
            }
            clearForm();
            onClose();
        } else {
            const errorData = await response.json();

            setError(errorData);
            openSnackbar(errorData);
            console.error('API error:', errorData.message || errorData);
        }
    };



    // receive file from form
    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files); // Convert the FileList to an array
            files.forEach(file => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    // Ensure reader.result is a string before adding it
                    if (typeof reader.result === 'string') {
                        setSelectedImageData(prevImages => [...prevImages, reader.result as string]);
                    }
                };
            });
            setSelectedImage(files);

            setIsNewImageSelected(true);
        }
    };




    const handleCancel = () => {
        if (onClose) {
            onClose();
        }
        clearForm();
    }





    const paperProps = {
        style: {
            borderRadius: '5px',
            border: error.errors ? '1px solid red' : '',
            width: '100%'
        },
    };

    const buttonOptions = selectedBrand ? 'Save Changes' : 'Add Brand'






    const parseChatGPTResponse = (response: { description: string; tags: string[]; }) => {
        return {
            description: response.description,
            tags: response.tags
        };
    };

    const fetchChatGPTDetails = async (brandName: string) => {
        console.log(apiKey)
        const openAIResponse = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo-instruct',
                prompt: `Create a JSON object with a detailed description and tags for an e-cigarette brand. The brand name is "${brandName}". Ensure the description is no more than 300 characters and includes key features and benefits. Generate tags related to the brand, limited to 8 words. The JSON should have keys for 'description' and 'tags'.
                `,
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1.0,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
            })
        });

        if (!openAIResponse.ok) {
            throw new Error('Failed to fetch from OpenAI');
        }

        const data = await openAIResponse.json();
        const res = data.choices[0].text
        const cleanedRes = JSON.parse(res)
        console.log(cleanedRes);
        return cleanedRes
    };



    const handleGenerateDetails = async () => {
        if (!brandData.name) {
            alert('Please enter the brand name first.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetchChatGPTDetails(brandData.name);
            // Assuming response contains the brand details in a structured format
            const generatedDetails = parseChatGPTResponse(response);
            setBrandData({ ...brandData, ...generatedDetails });
        } catch (error) {
            console.error('Failed to generate brand details:', error);
            // Handle error appropriately
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={4000} // Adjust the duration as needed
                onClose={() => setIsSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert severity="error" onClose={() => setIsSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Dialog open={open} PaperProps={paperProps} fullWidth>


                <DialogTitle
                    className='bg-primary-variant text-center uppercase h-18'
                >{selectedBrand ? 'Edit Brand Details' : 'Add New Brand'}</DialogTitle>

                <DialogContent sx={{ borderRadius: 3 }} className='bg-dark-surface border-primary-variant border-4'>

                    <DialogContentText sx={{ my: 2 }} >
                        Please fill in the details of the new brand.
                    </DialogContentText>

                    <DialogContentText variant='caption' sx={{ m: 2, color: '#D23030' }}>
                        Fields with * are required.
                    </DialogContentText>

                    {loading && <CircularProgress />}


                    <BrandForm brandData={brandData}
                        error={error}
                        handleChange={handleChange}
                        handleIsActiveChange={handleIsActiveChange}
                    />

                    {/* Image Upload */}
                    <ImageUpload
                        error={error}
                        loading={loading}
                        selectedImage={selectedImage}
                        selectedImageData={selectedImageData}
                        handleImage={handleImage}
                        setSelectedImageData={setSelectedImageData}
                    />

                    {/* Rating */}
                    <KeywordsInput
                        Keywords={brandData.tags}
                        onAddKeyword={handleAddKeyword}
                        onRemoveKeyword={handleRemoveKeyword}
                    />
                </DialogContent>
                <div className='bg-primary-variant flex justify-between py-2, p-4 shadow'>
                    <Button onClick={clearForm} variant='contained' color="secondary">
                        Clear Form
                    </Button>
                    <Button onClick={handleCancel} variant='contained' color="error">
                        Cancel
                    </Button>
                    <Button sx={{ minWidth: '142px', maxHeight: '36.5px' }} onClick={handleAddBrand} variant='contained' color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress /> : buttonOptions}
                    </Button>
                    <Button variant="contained" color='success' onClick={handleGenerateDetails}>Generate</Button>

                </div>

            </Dialog >
        </>
    )
};

export default AddBrandModal;