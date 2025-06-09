'use client';

import { useEffect, useState } from 'react';
import { IoImageOutline } from 'react-icons/io5';
import supabase from '../../supabase';
import { Spinner } from '@heroui/spinner';
import { Avatar, User } from '@heroui/react';
import { Image } from "@heroui/react";
import { BsBoxSeam } from "react-icons/bs";

interface ImageProductProps {
    ean: string;
    local?: string;
    size?: any;
    showbg?: boolean;
}

const ImageProduct: React.FC<ImageProductProps> = ({ ean, local, size, showbg }) => {
    const [image, setImage] = useState<string | null>(local || null);
    const [loadingImage, setLoadingImage] = useState(true);
    const [error, setError] = useState(false);

    const proxyUrl = 'https://corsproxy.io/?url=';
    const fontesPublicas = [
        `${proxyUrl}https://cdn-cosmos.bluesoft.com.br/products/${ean ? ean.slice(1) : 'null'}`,
        `${proxyUrl}http://www.dataload.com.br:9000/api/gtin/${ean ? ean.slice(1) : 'null'}`,
    ];


    const listarImagensSupabase = async () => {
        try {
            const { data, error } = await supabase
                .storage
                .from('imagens-produtos')
                .list(`0${ean}`, {
                    limit: 1,
                    offset: 0,
                    sortBy: { column: 'updated_at', order: 'desc' },
                });

            if (error) throw error;

            console.log(data);

            if (data?.length === 0) {
                return;
            }

            const mostRecentImage = data?.[0]?.name;
            if (mostRecentImage) {
                const { data: imageData } = supabase
                    .storage
                    .from('imagens-produtos')
                    .getPublicUrl(`0${ean}/${mostRecentImage}`);
                setImage(imageData.publicUrl);
                setLoadingImage(false);
            } else {
            }
        } catch (error) {
            console.log("Error fetching images from Supabase:", error);
        }
    };

    const testPublicSources = async () => {
        for (let i = 0; i < fontesPublicas.length; i++) {
            const source = fontesPublicas[i];
            try {
                const response = await fetch(source);
                if (response.ok) {
                    setImage(source);
                    setLoadingImage(false);
                    return;
                }
            } catch (error) {
                if (i === fontesPublicas.length - 1) {
                    setImage(null);
                    setLoadingImage(false);
                }
            }
        }
    };

    useEffect(() => {
        listarImagensSupabase();
    }, [ean]);

    if (!image) {
        return (
            <Avatar
                size={size || 'md'}
                className={showbg ? 'bg-default-100' : 'bg-transparent'}
                showFallback={true}
                fallback={
                    <BsBoxSeam />
                }
                radius='sm'
            />
        )
    }


    return (
        <Avatar
            size={size || 'md'}
            className={showbg ? 'bg-default-100' : 'bg-transparent'}
            showFallback={true}
            fallback={
                <BsBoxSeam />
            }
            radius='sm'
            src={image}
        />

    );
};

export default ImageProduct;
