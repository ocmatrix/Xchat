# DOTCOM Security Specification (Firebase)

## Data Invariants
1. A message MUST belong to a conversation.
2. Access to messages is strictly limited to participants of the parent conversation.
3. Users can only modify their own profiles.
4. Invites are public for reading but strictly controlled for creation.
5. Timestamps MUST be server-generated.

## The Dirty Dozen (Attacker Payloads)
1. **Identity Spoofing**: User A tries to send a message as User B by setting `senderId: "UserB"`.
2. **Conversation Hijack**: User A tries to add themselves to a private conversation they aren't part of.
3. **Ghost Field Update**: User A tries to set `isAdmin: true` on their own profile.
4. **ID Poisoning**: Creating a message with a 2MB string as ID.
5. **Timestamp Fraud**: Setting `timestamp` to 10 years in the future to keep messages at bottom.
6. **Orphan Message**: Trying to write a message to a non-existent conversation ID.
7. **Policy Bypass**: Trying to change the `isIsolated` status of a conversation they don't own.
8. **Shadow List**: Querying all conversations in the database without being a participant.
9. **TTL Termination**: Manually deleting a message that should only be deleted by system.
10. **Invite Brute Force**: Guessing codes (prevented by complex codes and rate limits).
11. **Metadata Leak**: Reading `users` list without being authenticated.
12. **Content Poisoning**: Injecting 1MB of junk into the `nonce` field.

## Verification
Tests will be implemented in `firestore.rules.test.ts` to ensure rejection of all above payloads.
