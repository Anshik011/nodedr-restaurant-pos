import { OrdersService } from './orders.service';
export declare class ScheduledOrdersService {
    private readonly orders;
    private readonly logger;
    constructor(orders: OrdersService);
    tick(): Promise<void>;
}
