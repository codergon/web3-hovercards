import { useAddressInfo } from "../context/AddressInfoContext";

const Avatar = () => {
  const { avatar } = useAddressInfo();

  return (
    <div className="web3-hovercard__header-img">
      <img alt="user avatar" src={chrome.runtime.getURL(avatar)} />
    </div>
  );
};

export default Avatar;
