import { type CampaignDto, type CouponDto, type PromotionDto, type SessionUser } from '@nodedr-restaurant/types';
import { AuditService } from '../../audit/audit.service';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { MarketingService } from './marketing.service';
export declare class MarketingController {
    private readonly marketing;
    private readonly branchAccess;
    private readonly audit;
    constructor(marketing: MarketingService, branchAccess: BranchAccessService, audit: AuditService);
    private access;
    coupons(u: SessionUser, branchId: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }[]>;
    createCoupon(u: SessionUser, branchId: string, body: CouponDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }>;
    couponActive(u: SessionUser, branchId: string, id: string, body: {
        isActive: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }>;
    deleteCoupon(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    promotions(u: SessionUser, branchId: string): Promise<{
        startTime: string;
        endTime: string;
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        daysOfWeek: number[];
        startMinute: number;
        endMinute: number;
    }[]>;
    createPromotion(u: SessionUser, branchId: string, body: PromotionDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        daysOfWeek: number[];
        startMinute: number;
        endMinute: number;
    }>;
    promotionActive(u: SessionUser, branchId: string, id: string, body: {
        isActive: boolean;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        kind: import("@prisma/client").$Enums.DiscountKind;
        daysOfWeek: number[];
        startMinute: number;
        endMinute: number;
    }>;
    deletePromotion(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    campaigns(u: SessionUser, branchId: string): Promise<{
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
    createCampaign(u: SessionUser, branchId: string, body: CampaignDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        branchId: string;
        channel: import("@prisma/client").$Enums.CampaignChannel;
        message: string;
        segment: import("@prisma/client").$Enums.CampaignSegment;
        lastSentAt: Date | null;
        lastSentCount: number | null;
    }>;
    deleteCampaign(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    audience(u: SessionUser, branchId: string, id: string): Promise<{
        count: number;
        recipients: {
            name: string;
            contact: string;
        }[];
    }>;
    sendCampaign(u: SessionUser, branchId: string, id: string): Promise<{
        sent: number;
        failed: number;
    }>;
    audienceCsv(u: SessionUser, branchId: string, id: string): Promise<string>;
}
