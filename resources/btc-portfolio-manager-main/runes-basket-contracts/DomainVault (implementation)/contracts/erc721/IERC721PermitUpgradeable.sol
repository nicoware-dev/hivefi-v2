//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title IERC721WithPermit
/// @author Simon Fremaux (@dievardump) & William Schwab
/// @notice Required interface
interface IERC721PermitUpgradeable {

    /**
     * @dev Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32);

    /// @notice Approve of a specific token ID for spending by spender via signature
    /// @param spender The account that is being approved
    /// @param tokenId The ID of the token that is being approved for spending
    /// @param deadline The deadline timestamp by which the call must be mined for the approve to work
    /// @param v signature permit
    /// @param r signature permit
    /// @param s signature permit
    function permit(address spender, uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;

    //function mintVerify(address curator, bytes32 salt, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;

    //function burnVerify(address curator, bytes32 salt, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;

    /// @notice Allows to retrieve current nonce for token
    /// @param tokenId token id
    /// @return current token nonce
    function nonces(uint256 tokenId) external view returns (uint256);

    function mintNonces(address curator) external view returns (uint256);

    function burnNonces(address curator) external view returns (uint256);

    function setAuthorizer(address _newAuthorizer) external;

    function getAuthorizer() external view returns (address);
}
