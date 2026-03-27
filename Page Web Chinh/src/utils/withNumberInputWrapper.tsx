

interface WithNumberInputWrapperProps {
  value?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const WithNumberInputWrapper = (Component: any) => {
  return function (props: WithNumberInputWrapperProps) {
    return <Component {...props} />;
  };
};
export default WithNumberInputWrapper;
