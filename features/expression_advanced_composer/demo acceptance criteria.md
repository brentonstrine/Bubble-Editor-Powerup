Acceptance Criteria

1. Seems to be missing the initial Slot
2. When I select "token" from the dropdown, it needs to clear [Slot A] and move my cursor into [Slot B] after the inserted Token.
3. The dropdown of available tokens to select from doesn't appear when the focus is moved to that slot.
4. The dropdown only lets you pick what is valid for what is on the LEFT side. But it may be invalid for what is on the RIGHT. If you make it invalid, then the [SLOT] where the connection is invalid becomes red
5. Wherever I drop the token, it should drop there. There should be a very clear indicator of exactly where it's going to drop. importantlly; this indicator shoudl NOT add width! it should either be a hidden element or a border which already has a width but is transparent being made visible. 
6. The border of the drop zone should change width. (That moves the DOM elements and causes problems. It can change color but not width. )
7. When a selection is dropped, we need to make sure that there is a SLOT between it and the neighbor token. 
8. The options dropdown automatically expands when it is no longer active.
9. When using arrow keys to move which item is active, it shouldn't skip the slots. (It should be able to move left and right between tokens and slots.)
10. When an operator is activated, the dropdown should expand to show the available operators. 
11. When a token is activated, the text should be focused and all of the text should be selected (so that typing will replace all of the content)
12. When shift is held but the current item is a slot, the final selection should not include that slot. In other words, selections never have a slot on the left or right end.
13. When an item has an invalid connection, the slot between them should be red.
14. When I drag and drop any part of a selected string of items, all of them should be dropped into the new location.
15. When dropping a selected string of items, the item order should be preserved when dropped.
16. When dropping a string of items, the full set of items should be dropped, with no items removed from the string.
17. If you drop onto a token, it should drop on the nearest slot. If it's on the left 50% of a token, it should drop on the slot to the left of that token. If it's dropped on the right 50% of a token, it should be dropped on the slot to the right. 
18. When dragging an item or string of items before dropping, whichever slot will receive it when dropped should have a yellow border to indicate that that's the drop zone. 
19. Dropping items should be instant. There should be no animation or transition. There should not be any lag, delay, or hanging.
20. Slots are small and going back to the larger size when active. When hovered, it merely changes color/border, not size.
21. The last slot is special. It is full size & visible color. This way when you start with an empty expression, you have something to click on, and when you have an expression in place, it's obvious that you can add on to the end.
22. Slots are always visible, though they are subtle when you're not interacting with them.