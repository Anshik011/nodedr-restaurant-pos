import { Prisma } from '@prisma/client';
import type { CampaignDto, CouponDto, PromotionDto } from '@nodedr-restaurant/types';
import { BranchTimeService } from '../../common/services/branch-time.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WebhooksService } from '../webhooks/webhooks.service';
export interface CheckoutDiscount {
    amount: number;
    couponId?: string;
    couponCode?: string;
    promotionName?: string;
}
export declare class MarketingService {
    private readonly prisma;
    private readonly time;
    private readonly email;
    private readonly webhooks;
    constructor(prisma: PrismaService, time: BranchTimeService, email: EmailService, webhooks: WebhooksService);
    listCoupons(branchId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        code: string;
        value: Prisma.Decimal;
        minOrderAmount: Prisma.Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        maxDiscount: Prisma.Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }[]>;
    createCoupon(branchId: string, dto: CouponDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        code: string;
        value: Prisma.Decimal;
        minOrderAmount: Prisma.Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        maxDiscount: Prisma.Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }>;
    setCouponActive(branchId: string, id: string, isActive: boolean): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        code: string;
        value: Prisma.Decimal;
        minOrderAmount: Prisma.Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        maxDiscount: Prisma.Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }>;
    deleteCoupon(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    private getCoupon;
    listPromotions(branchId: string): Promise<{
        startTime: string;
        endTime: string;
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        value: Prisma.Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        daysOfWeek: number[];
        startMinute: number;
        endMinute: number;
    }[]>;
    createPromotion(branchId: string, dto: PromotionDto): Prisma.Prisma__PromotionClient<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        value: Prisma.Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        daysOfWeek: number[];
        startMinute: number;
        endMinute: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    setPromotionActive(branchId: string, id: string, isActive: boolean): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        value: Prisma.Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        daysOfWeek: number[];
        startMinute: number;
        endMinute: number;
    }>;
    deletePromotion(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    resolveCheckoutDiscount(branchId: string, subtotal: number, couponCode: string | undefined, now?: Date): Promise<CheckoutDiscount>;
    redeemCoupon(tx: Prisma.TransactionClient, couponId: string): Promise<void>;
    listCampaigns(branchId: string): Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        branchId: string;
        channel: import("@prisma/client").$Enums.CampaignChannel;
        message: string;
        segment: import("@prisma/client").$Enums.CampaignSegment;
        lastSentAt: Date | null;
        lastSentCount: number | null;
    }[]>;
    createCampaign(branchId: string, dto: CampaignDto): Prisma.Prisma__CampaignClient<{
        id: string;
        name: string;
        createdAt: Date;
        branchId: string;
        channel: import("@prisma/client").$Enums.CampaignChannel;
        message: string;
        segment: import("@prisma/client").$Enums.CampaignSegment;
        lastSentAt: Date | null;
        lastSentCount: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    deleteCampaign(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    audience(branchId: string, campaignId: string): Promise<{
        campaign: {
            id: string;
            name: string;
            createdAt: Date;
            branchId: string;
            channel: import("@prisma/client").$Enums.CampaignChannel;
            message: string;
            segment: import("@prisma/client").$Enums.CampaignSegment;
            lastSentAt: Date | null;
            lastSentCount: number | null;
        };
        recipients: {
            name: string;
            contact: string;
        }[];
    }>;
    send(branchId: string, campaignId: string): Promise<{
        sent: number;
        failed: number;
    }>;
    private releaseAndFail;
}
