import { IPushSubscription } from '../models/PushSubscription';
export declare class PushService {
    private pushEnabled;
    constructor();
    saveSubscription(subscription: any, userId: string): Promise<IPushSubscription>;
    removeSubscription(endpoint: string): Promise<void>;
    sendNotificationToUser(userId: string, payload: object): Promise<void>;
}
export declare const pushService: PushService;
//# sourceMappingURL=pushService.d.ts.map