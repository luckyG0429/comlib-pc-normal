import dump from './dump.json';
import { enhancedIt, dumpPreview } from '@/../cypress/tools';

describe('表格样式升级测试', () => {
  enhancedIt('各种 样式 检查', () => {
    dumpPreview(dump);
    cy.compareSnapshot('表格样式升级测试');
  });
});