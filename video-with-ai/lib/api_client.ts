import { IVideo } from "@/models/video";

export type VideoFormData = Omit<IVideo, 'id'>;

type FetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

export class ApiClient {
    private async fetch<T>(
        endpoint: string,
        options: FetchOptions = {}
    ) : Promise<T> {
        const {method = 'GET', body, headers = {}} = options;

        const defaultHeaders = {
            'content-type': 'application/json',
            ...headers
        }

        const response = await fetch(`/api${endpoint}`, {
            method,
            headers: defaultHeaders,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json();
    };

    async getAllVideos(){
        return this.fetch('/videos');
    }

    async createVideo(videoData: VideoFormData){
        return this.fetch('/videos', {
            method: 'POST',
            body: videoData
        });
    }
};

export const apiClient = new ApiClient();
