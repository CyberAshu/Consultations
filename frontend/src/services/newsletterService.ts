import { apiPost } from './api';
import { 
  NewsletterSubscription,
  NewsletterResponse 
} from './types';

class NewsletterService {
  // Subscribe to newsletter
  async subscribe(subscriptionData: NewsletterSubscription): Promise<NewsletterResponse> {
    return apiPost<NewsletterResponse>('/newsletter/subscribe', subscriptionData);
  }

  // Unsubscribe from newsletter
  async unsubscribe(subscriptionData: NewsletterSubscription): Promise<NewsletterResponse> {
    return apiPost<NewsletterResponse>('/newsletter/unsubscribe', subscriptionData);
  }
}

export const newsletterService = new NewsletterService();
