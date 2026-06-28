-- AlterTable
ALTER TABLE "patient_profiles" ADD COLUMN     "parentId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
