import { Router } from "express";
import { createGroup, createInvite, getGroupDetail, getInvitePreview, joinGroupViaInvite, searchGroups } from "../controllers/groupController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { createGroupSchema, groupIdParamSchema, searchGroupsQuerySchema } from "../schemas/groupSchemas";

const router = Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);
router.post("/:id/invite", authMiddleware, validate(groupIdParamSchema, "params"), createInvite);
router.get("/invite/:token", authMiddleware, getInvitePreview);
router.post("/invite/:token/join", authMiddleware, joinGroupViaInvite);
router.get("/", authMiddleware, validate(searchGroupsQuerySchema, "query"), searchGroups);
router.get("/:id", authMiddleware, validate(groupIdParamSchema, "params"), getGroupDetail);

export default router;