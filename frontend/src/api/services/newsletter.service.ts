import { apiPost } from '../client';
import { 
  NewsletterSubscription,
  NewsletterResponse 
} from '../../types/service.types';

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
