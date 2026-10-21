import { describe,expect,it } from 'vitest';
import { HANDLE_POSITIONS } from '../src/config/consoleLayout.js';
import { handleMasterKeyDown } from '../src/interactions/keyboardHandlers.js';
describe('8 master-handle detents',()=>{
 it('exposes all eight physically ordered positions',()=>{expect(HANDLE_POSITIONS).toEqual(['EB','B3','B2','B1','N','P1','P2','P3']);});
 it('moves from N to P1 using ArrowRight',()=>{
 let selected=null;handleMasterKeyDown({key:'ArrowRight',preventDefault(){}},'N',x=>{selected=x;});expect(selected).toBe('P1');
 });
});
